/* application.js
 *
 * Copyright 2023 Ideve Core
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import { gettext as _ } from 'gettext';
import Window from './window.js';
import Preferences from './pages/preferences/preferences.js';
import Shortcuts from './pages/shortcuts/shortcuts.js';
import {
  getGIRepositoryVersion,
  getGjsVersion,
  getGLibVersion,
} from "../troll/src/util.js";
import { getFlatpakInfo } from './utils.js';
import './pages/timer/timer.js';
import './pages/statistics/statistics.js';
import { History } from './pages/history/history.js';
import './style.css';
import Application_data from './application_data.js';
import Timer from './Timer.js';

export default class Application extends Adw.Application {
  static {
    GObject.registerClass(this);
  }
  constructor() {
    super({ application_id: pkg.name, flags: Gio.ApplicationFlags.DEFAULT_FLAGS });
    this.settings = new Gio.Settings({
      schema_id: pkg.name,
    });
    this.timer_state = 'stopped';
    this.data = new Application_data().setup();
    this.Timer = new Timer(this);
    this._setup_actions();
  }
  _setup_actions() {
    const quit_action = new Gio.SimpleAction({ name: 'quit' });
    const preferences_action = new Gio.SimpleAction({ name: 'preferences' });
    const history_action = new Gio.SimpleAction({ name: 'history' });
    const shortcuts_action = new Gio.SimpleAction({ name: 'shortcuts' });
    const show_about_action = new Gio.SimpleAction({ name: 'about' });
    const active_action = new Gio.SimpleAction({ name: 'open' });

    quit_action.connect('activate', () => {
      if (this.active_window.visible) {
        this._request_quit()
      } else {
        this._open_close_option_dialog()
      }
    });
    preferences_action.connect('activate', () => {
      new Preferences(this).present();
    });
    history_action.connect('activate', () => {
      this.history = new History(this);
      this.history.present();
    });
    shortcuts_action.connect('activate', () => {
      new Shortcuts(this).present();
    })
    show_about_action.connect('activate', () => {
      const aboutWindow = this._create_about_dialog();
      aboutWindow.present();
    });
    active_action.connect("activate", () => {
      this.active_window.show();
    })
    this.add_action(quit_action);
    this.add_action(preferences_action);
    this.add_action(history_action);
    this.add_action(shortcuts_action);
    this.set_accels_for_action('app.quit', ['<primary>q']);
    this.add_action(show_about_action);
    this.add_action(active_action);
  }
  _create_about_dialog() {
    const flatpak_info = getFlatpakInfo();
    const debug_info = `
${pkg.name} ${pkg.version}
${GLib.get_os_info("ID")} ${GLib.get_os_info("VERSION_ID")}
GJS ${getGjsVersion()}
Adw ${getGIRepositoryVersion(Adw)}
GTK ${getGIRepositoryVersion(Gtk)}
GLib ${getGLibVersion()}
Flatpak ${flatpak_info.get_string("Instance", "flatpak-version")}
Blueprint 0.10.0
    `.trim();
    let aboutParams = {
      transient_for: this.active_window,
      application_name: 'Pomodoro',
      application_icon: pkg.name,
      developer_name: 'Ideve Core',
      version: pkg.version,
      developers: [
        'Ideve Core'
      ],
      issue_url: 'https://gitlab.com/idevecore/pomodoro/-/issues',
      debug_info,
      copyright: '© 2023 Ideve Core',
    };
    return new Adw.AboutWindow(aboutParams);
  }

  /**
   *
   * Request quit
   *
   */
  _request_quit() {
    this.run_in_background = this.settings.get_boolean('run-in-background');
    if (!this.run_in_background) {
      this._open_close_option_dialog()
      return
    }
    if (this.Timer.timer_state === 'stopped') {
      this.quit();
      return
    }
    this.active_window.hide()
    if (!this.active_window)
      return
  }
  _open_close_option_dialog() {
    let dialog = new Adw.MessageDialog();
    dialog.set_heading(_('Stop timer?'));
    dialog.set_transient_for(this.get_active_window());
    dialog.set_body(_('There is a running timer, wants to stop and exit the application?'));
    dialog.add_response('continue', _('Continue'));
    dialog.add_response('exit', _('Exit'));
    dialog.set_response_appearance('exit', Adw.ResponseAppearance.DESTRUCTIVE);

    dialog.connect('response', (dialog, id) => {
      if (id === 'exit') {
        this.Timer.timer_state = 'stopped';
        setTimeout(() => {
          this.quit()
        }, 1000)
      }
    })
    if (this.Timer.timer_state === 'running' || this.Timer.timer_state == 'paused') {
      return dialog.present()
    }
    this.quit()
  }
  _send_notification({ title, body }) {
    const notification = new Gio.Notification();
    notification.set_title(title);
    notification.set_body(body);
    notification.set_priority('presence');
    notification.set_default_action("app.open");
    this.send_notification("lunch-is-ready", notification);
  }
  _play_sound({ name, cancellable }) {
    if (!this.settings.get_boolean('play-sounds')) return
    return new Promise((resolve, reject) => {
      this.gsound.play_full(
        { 'event.id': name },
        cancellable,
        (source, res) => {
          try {
            resolve(source.play_full_finish(res));
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  }
  _load_background_portal_status(message) {
    const connection = Gio.DBus.session;
    const messageVariant = new GLib.Variant('(a{sv})', [{
      'message': new GLib.Variant('s', message)
    }]);
    connection.call(
      'org.freedesktop.portal.Desktop',
      '/org/freedesktop/portal/desktop',
      'org.freedesktop.portal.Background',
      'SetStatus',
      messageVariant,
      null,
      Gio.DBusCallFlags.NONE,
      -1,
      null,
      (connection, res) => {
        try {
          connection.call_finish(res);
        } catch (e) {
          if (e instanceof Gio.DBusError)
            Gio.DBusError.strip_remote_error(e);

          logError(e);
        }
      }
    );
  }
  vfunc_activate() {
    let { active_window } = this;
    if (!active_window) {
      active_window = new Window(this);
      this.settings.bind(
        "width",
        active_window,
        "default-width",
        Gio.SettingsBindFlags.DEFAULT,
      );
      this.settings.bind(
        "height",
        active_window,
        "default-height",
        Gio.SettingsBindFlags.DEFAULT,
      );
      this.settings.bind(
        "is-maximized",
        active_window,
        "maximized",
        Gio.SettingsBindFlags.DEFAULT,
      );
      this.settings.bind(
        "is-fullscreen",
        active_window,
        "fullscreened",
        Gio.SettingsBindFlags.DEFAULT,
      );
    }
    active_window.present();
  }
};
