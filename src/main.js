/* main.js
 *
 * Copyright 2023 Francisco Jeferson dos Santos Freires
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

import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw?version=1';
import Gst from 'gi://Gst';
import { Application_data, close_request } from './utils.js';

import { PomodoroWindow } from './window.js';
import './timer.js';
import './statistics.js';
import './historic.js';

pkg.initGettext();
pkg.initFormat();

export const PomodoroApplication = GObject.registerClass(
  class PomodoroApplication extends Adw.Application {
    constructor() {
      super({ application_id: 'com.gitlab.idevecore.Pomodoro', flags: Gio.ApplicationFlags.DEFAULT_FLAGS });

      new Application_data().get()

      const quit_action = new Gio.SimpleAction({ name: 'quit' });
      quit_action.connect('activate', action => {
        close_request.bind(this)()
      });
      this.add_action(quit_action);
      this.set_accels_for_action('app.quit', ['<primary>q']);

      const show_about_action = new Gio.SimpleAction({ name: 'about' });
      show_about_action.connect('activate', action => {
        let aboutParams = {
          transient_for: this.active_window,
          application_name: 'pomodoro',
          application_icon: 'com.gitlab.idevecore.Pomodoro',
          developer_name: 'Francisco Jeferson dos Santos Freires',
          version: '0.1.0',
          developers: [
            'Francisco Jeferson dos Santos Freires'
          ],
          copyright: '© 2023 Francisco Jeferson dos Santos Freires'
        };
        const aboutWindow = new Adw.AboutWindow(aboutParams);
        aboutWindow.present();
      });
      this.add_action(show_about_action);
    }

    vfunc_activate() {
      let { active_window } = this;

      if (!active_window)
        active_window = new PomodoroWindow(this);

      active_window.present();
    }
  }
);

export function main(argv) {
  Gst.init(null)
  const application = new PomodoroApplication();
  return application.runAsync(argv);
}
