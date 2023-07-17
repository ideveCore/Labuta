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
import Preferences from './preferences.js';
import Shortcuts from './shortcuts.js';
import Timer from './timer.js';
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
    this.settings = new Gio.Settings({
      schema_id: pkg.name,
      path: '/io/gitlab/idevecore/Pomodoro/',
    });

    quit_action.connect('activate', () => {
      this.quit();
      // if (this.active_window.visible) {
      //   this.request_quit();
      // } else {
      //   this.close_request.bind(this)()
      // }
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

    this.add_action(quit_action);
    this.add_action(preferences_action);
    this.add_action(shortcuts_action);
    this.set_accels_for_action('app.quit', ['<primary>q']);
    this.add_action(show_about_action);
    this.set_theme();
    this.settings.connect("changed::theme", this.set_theme.bind(this));
  }
  request_quit() {

  }
  close_request() {

  }
  set_theme() {
    const style_manager = Adw.StyleManager.get_default()
    if (this.settings.get_string('theme') === 'default') {
      style_manager.set_color_scheme(Adw.ColorScheme.DEFAULT)
    } else if (this.settings.get_string('theme') === 'dark') {
      style_manager.set_color_scheme(Adw.ColorScheme.FORCE_DARK)
    } else {
      style_manager.set_color_scheme(Adw.ColorScheme.FORCE_LIGHT)
    }
  }
  vfunc_activate() {
    let { active_window } = this;
    if (!active_window) {
      active_window = new Window({ application: this });
    }
    active_window.present();
  }
};
