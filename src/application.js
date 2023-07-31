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
import Timer from './pages/timer/timer.js';
import Statictics from './pages/statistics/statistics.js';
import History from './pages/history/history.js';
import './style.css';

export default class Application extends Adw.Application {
  static {
    GObject.registerClass(this);
  }
  constructor() {
    super({ application_id: pkg.name, flags: Gio.ApplicationFlags.DEFAULT_FLAGS });

    const quit_action = new Gio.SimpleAction({ name: 'quit' });
    const preferences_action = new Gio.SimpleAction({ name: 'preferences' });
    const shortcuts_action = new Gio.SimpleAction({ name: 'shortcuts' });
    const show_about_action = new Gio.SimpleAction({ name: 'about' });
    const active_action = new Gio.SimpleAction({ name: 'open' });
    this.settings = new Gio.Settings({
      schema_id: pkg.name,
      path: '/io/gitlab/idevecore/Pomodoro/',
    });
    this.timer_state = 'stopped';
    this.data = [];

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
    shortcuts_action.connect('activate', () => {
      new Shortcuts(this).present();
    })
    show_about_action.connect('activate', () => {
      let aboutParams = {
        transient_for: this.active_window,
        application_name: 'Pomodoro',
        application_icon: pkg.name,
        developer_name: 'Ideve Core',
        version: pkg.version,
        developers: [
          'Ideve Core'
        ],
        copyright: '© 2023 Ideve Core',
      };
      const aboutWindow = new Adw.AboutWindow(aboutParams);
      aboutWindow.present();
    });
    active_action.connect("activate", () => {
      this.active_window.show();
    })

    this.add_action(quit_action);
    this.add_action(preferences_action);
    this.add_action(shortcuts_action);
    this.set_accels_for_action('app.quit', ['<primary>q']);
    this.add_action(show_about_action);
    this.add_action(active_action);
    this._load_application_theme();
    this.settings.connect("changed::theme", this._load_application_theme.bind(this));
    this._load_data();
  }
  _request_quit() {
    this.run_in_background = this.settings.get_boolean('run-in-background');
    if (!this.run_in_background) {
      this._open_close_option_dialog()
      return
    }
    if (this.timer_state === 'stopped') {
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
    dialog.set_transient_for(this.active_window);
    dialog.set_body(_('There is a running timer, wants to stop and exit the application?'));
    dialog.add_response('continue', _('Continue'));
    dialog.add_response('exit', _('Exit'));
    dialog.set_response_appearance('exit', Adw.ResponseAppearance.DESTRUCTIVE);

    dialog.connect('response', (dialog, id) => {
      if (id === 'exit') {
        this.timer_state = 'stopped';
        setTimeout(() => {
          this.quit()
        }, 1000)
      }
    })
    if (this.timer_state === 'running' || this.timer_state == 'paused') {
      return dialog.present()
    }
    this.quit()
  }
  _load_application_theme() {
    const style_manager = Adw.StyleManager.get_default()
    if (this.settings.get_string('theme') === 'default') {
      style_manager.set_color_scheme(Adw.ColorScheme.DEFAULT)
    } else if (this.settings.get_string('theme') === 'dark') {
      style_manager.set_color_scheme(Adw.ColorScheme.FORCE_DARK)
    } else {
      style_manager.set_color_scheme(Adw.ColorScheme.FORCE_LIGHT)
    }
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
  _save_data() {
    const data_dir = GLib.get_user_config_dir();
    const destination = GLib.build_filenamev([data_dir, 'data.json'])
    const destination_file = Gio.File.new_for_path(destination)

    destination_file.replace_contents(JSON.stringify(this.data), null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
  }
  _load_data() {
    const data_dir = GLib.get_user_config_dir();
    const destination = GLib.build_filenamev([data_dir, 'data.json'])
    const destination_file = Gio.File.new_for_path(destination)

    try {
      const [, contents] = destination_file.load_contents(null);
      const decoder = new TextDecoder('utf-8');
      this.data = JSON.parse(decoder.decode(contents));
    } catch (error) {
      destination_file.create(Gio.FileCreateFlags.NONE, null);
      destination_file.replace_contents(JSON.stringify([]), null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
      const [, contents] = destination_file.load_contents(null);
      const decoder = new TextDecoder('utf-8');
      this.data = JSON.parse(decoder.decode(contents));
    }
  }
  vfunc_activate() {
    let { active_window } = this;
    if (!active_window) {
      active_window = new Window(this);
    }
    active_window.present();
  }
};
