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
import './style.css';

export default class Application extends Adw.Application {
  static {
    GObject.registerClass(this);
  }
  constructor() {
    super({ application_id: pkg.name, flags: Gio.ApplicationFlags.DEFAULT_FLAGS });

    const quit_action = new Gio.SimpleAction({ name: 'quit' });
    const preferences_action = new Gio.SimpleAction({ name: 'preferences' });
    const show_about_action = new Gio.SimpleAction({ name: 'about' });

    quit_action.connect('activate', () => {
      if (this.active_window.visible) {
        this.request_quit();
      } else {
        this.close_request.bind(this)()
      }
    });
    preferences_action.connect('activate', () => {
      console.log('preferences')
    });
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
        copyright: '© 2023 Ideve Core'
      };
      const aboutWindow = new Adw.AboutWindow(aboutParams);
      aboutWindow.present();
    });

    this.add_action(quit_action);
    this.add_action(preferences_action);
    this.set_accels_for_action('app.quit', ['<primary>q']);
    this.add_action(show_about_action);
  }
  request_quit() {

  }
  close_request() {

  }
  vfunc_activate() {
    let { active_window } = this;
    if (!active_window) {
      active_window = new Window({ application: this });
    }
    active_window.present();
  }
};
