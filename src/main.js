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
import Adw from 'gi://Adw?version=1';
import Gst from 'gi://Gst';

import { PomodoroWindow } from './window.js';
import { Application_data, close_request, set_theme } from './utils.js';
import { PomodoroPreferences } from './preferences.js';
import { timer_state, application, settings } from './stores.js';
import './timer.js';
import './statistics.js';
import './history.js';

pkg.initGettext();
pkg.initFormat();

export const PomodoroApplication = GObject.registerClass(
  class PomodoroApplication extends Adw.Application {
    constructor() {
      super({ application_id: 'io.gitlab.idevecore.Pomodoro', flags: Gio.ApplicationFlags.DEFAULT_FLAGS });
      new Application_data().get()
      application.update(() => this)
      const quit_action = new Gio.SimpleAction({ name: 'quit' });
      const preferences = new Gio.SimpleAction({ name: 'preferences' });

      quit_action.connect('activate', action => {
        close_request.bind(this)()
      });

      preferences.connect('activate', action => {
        new PomodoroPreferences().present()
      })

      this.add_action(quit_action);
      this.add_action(preferences)
      this.set_accels_for_action('app.quit', ['<primary>q']);
      this.window = null;
      set_theme()

      const show_about_action = new Gio.SimpleAction({ name: 'about' });
      show_about_action.connect('activate', action => {
        let aboutParams = {
          transient_for: this.active_window,
          application_name: 'Pomodoro',
          application_icon: 'io.gitlab.idevecore.Pomodoro',
          developer_name: 'Ideve Core',
          version: '0.1.0',
          developers: [
            'Ideve Core'
          ],
          copyright: '© 2023 Ideve Core'
        };
        const aboutWindow = new Adw.AboutWindow(aboutParams);
        aboutWindow.present();
      });
      this.add_action(show_about_action);

    }

    request_quit() {
      this.run_in_background = settings.get_boolean('run-in-background');
      if (!this.run_in_background) {
        this.quit();
        return
      }
      timer_state.subscribe((value) => {
        if (value === 'stopped') {
          this.quit();
          return
        }
        this.window.hide()
      })
      if (!this.window)
        return
    }

    vfunc_activate() {
      let { active_window } = this;

      if (!active_window) {
        active_window = new PomodoroWindow(this);
      }


      active_window.present();
      this.window = active_window;
    }
  }
);

export function main(argv) {
  Gst.init(null)
  const application = new PomodoroApplication();
  return application.runAsync(argv);
}
