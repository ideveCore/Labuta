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
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Template from './window.blp' assert { type: 'uri' };
import ThemeSelector from './components/theme-selector/theme-selector.js';

export default class Window extends Adw.ApplicationWindow {
  static {
    GObject.registerClass({
      Template,
      InternalChildren: [
        'stack',
        'menu_button'
      ],
    }, this);
  }
  constructor(application) {
    super({ application });


    // Add theme selector from troll into primary menu
    const theme_selector = new ThemeSelector()
    // console.log(theme_selector)
    this._menu_button.get_popover().add_child(theme_selector, 'theme');

    this.connect('close-request', () => {
      application._request_quit()
      return true
    })

    this._stack.connect('notify::visible-child', () => {
      if (this._stack.visible_child_name == 'history') {
        this._stack.visible_child._load_history_list();
      } else if (this._stack.visible_child_name == 'statistics') {
        this._stack.visible_child._load_statistics_data();
      }
    });
  }

  _navigate(navigate) {
    this._stack.visible_child_name = navigate;
  }
}
