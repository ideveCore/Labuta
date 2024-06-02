/* window.js
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

import GObject from 'gi://GObject';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import GLib from 'gi://GLib';
import { shortcuts } from './components/shortcuts/main.js';
import { timer } from './pages/timer/main.js';
import { statistics } from './pages/statistics/main.js';
import { display_timer } from './components/display-timer/main.js';
import Resource from './window.blp';

/**
 *
 * Creates and returns a timer controls component.
 *
 * @param {GObject.Application} application The application object.
 * @returns {Gtk.Widget} The timer controls component.
 *
 */
export const window = ({ application }) => {
  const builder = new Gtk.Builder();
  const settings = application.utils.settings;

  builder.add_from_resource(Resource);

  const component = builder.get_object("component");
  const shorten_window_button = builder.get_object("shorten_window_button");

  settings.bind(
    "width",
    component,
    "default-width",
    Gio.SettingsBindFlags.DEFAULT,
  );
  settings.bind(
    "height",
    component,
    "default-height",
    Gio.SettingsBindFlags.DEFAULT,
  );
  settings.bind(
    "is-maximized",
    component,
    "maximized",
    Gio.SettingsBindFlags.DEFAULT,
  );
  settings.bind(
    "is-fullscreen",
    component,
    "fullscreened",
    Gio.SettingsBindFlags.DEFAULT,
  );

  builder.get_object("timer_page").set_child(
    timer(
      {
        application,
        display_timer: display_timer({ application }),
      }
    )
  );
  builder.get_object("statistics_page").set_child(
    statistics({ application })
  );

  application.utils.timer.connect('start', () => shorten_window_button.set_visible(true));
  application.utils.timer.connect('stop', () => shorten_window_button.set_visible(false));

  component.set_help_overlay(shortcuts({ application }));
  component.set_application(application);
  component.connect('close-request', () => {
    application.quit_request();
    return true;
  });
  return component;
}

/**
 *
 * Create Window page
 * @class
 * @extends {Adw.ApplicationWindow}
 *
 */
// export class Window extends Adw.ApplicationWindow {
//   static {
//     GObject.registerClass({
//       Template,
//       GTypeName: 'Window',
//       InternalChildren: [
//         'stack',
//         'shorten_window',
//         'menu_button',
//         'toast_overlay',
//         'statistics_page',
//         'timer_page',
//       ],
//     }, this);
//   }

//     this._setup_actions();
//     this._small_window.insert_action_group("window", this.window_group);
//     this._shorten_window.set_sensitive(false);
//   }

//   /**
//    *
//    * Setup actions
//    *
//    */
//   _setup_actions() {
//     const toggle_small_window = new Gio.SimpleAction({ name: 'toggle-small-window', parameter_type: new GLib.Variant('s', '').get_type() });
//     this.window_group = new Gio.SimpleActionGroup();

//     toggle_small_window.connect('activate', (simple_action, parameter) => {
//       const value = parameter.get_string()[0];
//       if (value === 'open') {
//         this.hide();
//         this._small_window.present();
//       } else {
//         this.present();
//         this._small_window.hide();
//       }
//     });
//     this.add_action(toggle_small_window);
//     this.window_group.add_action(toggle_small_window)
//   }
// }
