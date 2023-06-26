/* window.js
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
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export const PomodoroWindow = GObject.registerClass({
  GTypeName: 'PomodoroWindow',
  Template: 'resource:///io/gitlab/idevecore/Pomodoro/window.ui',
  InternalChildren: ['stack'],
}, class PomodoroWindow extends Adw.ApplicationWindow {
  constructor(application) {
    super({ application });

    let navigation_action = new Gio.SimpleAction({
      name: 'navigation',
      parameter_type: new GLib.VariantType('s'),
    });

    navigation_action.connect('activate', (action, parameter) => {
      let navigate = parameter.deep_unpack();
      this.navigate(navigate)
    });

    application.add_action(navigation_action);

    this.connect('close-request', () => {
      application.request_quit()
    })
    this._stack.connect('notify::visible-child', () => {
      if (this._stack.visible_child_name == 'history') {
        this._stack.visible_child.load_list()
      } else if (this._stack.visible_child_name == 'statistics') {
        this._stack.visible_child.load_data()
      }
    });
  }

  navigate(navigate) {
    this._gsoundPlaySound('complete', null)
    this._stack.visible_child_name = navigate;
  }
});

