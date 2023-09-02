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
import GLib from 'gi://GLib';
import Template from './window.blp' assert { type: 'uri' };
import ThemeSelector from './components/theme-selector/theme-selector.js';
import Shortcuts from './components/shortcuts/shortcuts.js';
import { SmallWindow } from './components/small-window/small-window.js';

/**
 *
 * Create Window page
 * @class
 *
 */
export default class Window extends Adw.ApplicationWindow {
  static {
    GObject.registerClass({
      Template,
      GTypeName: 'Window',
      InternalChildren: [
        'stack',
        'shorten_window',
        'menu_button',
        'toast_overlay',
      ],
    }, this);
  }
  constructor(application) {
    super({ application });

    const theme_selector = new ThemeSelector();
    this._menu_button.get_popover().add_child(theme_selector, 'theme');
    this.set_help_overlay(new Shortcuts(application));
    this._small_window = new SmallWindow();

    this._setup_actions();

    this._small_window.insert_action_group("window", this.window_group);

    application.Timer.$start(() => {
      this._shorten_window.set_sensitive(true);
    });
    application.Timer.$stop(() => {
      this._shorten_window.set_sensitive(false);
    });

    this._shorten_window.set_sensitive(false);

    this.connect('close-request', () => {
      application._request_quit()
      return true
    })
    this._stack.connect('notify::visible-child', () => {
      if (this._stack.visible_child_name == 'statistics') {
        this._stack.visible_child._load_statistics_data();
      }
    });

  }
  /**
   *
   * Setup actions
   *
   */
  _setup_actions() {
    const toggle_small_window = new Gio.SimpleAction({ name: 'toggle-small-window', parameter_type: new GLib.Variant('s', '').get_type() });
    this.window_group = new Gio.SimpleActionGroup();

    toggle_small_window.connect('activate', (simple_action, parameter) => {
      const value = parameter.get_string()[0];
      if (value === 'open') {
        this.hide();
        this._small_window.present();
      } else {
        this.present();
        this._small_window.hide();
      }
    });
    this.add_action(toggle_small_window);
    this.window_group.add_action(toggle_small_window)
  }
}
