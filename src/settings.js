/* settings.js
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

import Gio from 'gi://Gio';
import GObject from 'gi://GObject';

/**
 *
 * Manage application settings
 * @class
 *
 */
export default class Settings extends Gio.Settings {
  static {
    GObject.registerClass({
      GTypeName: 'AppSettings',
    }, this);
  }

  /**
   *
   * Create GSettings instance
   * @param {object} params
   * @param {string} params.schema_id
   *
   */
  constructor(params = {}) {
    super(params);
    this._listeners = {
      timer_customization: [],
    };
    this._set_listeners();
  }

  /**
   *
   * Set listeners methods
   *
   */
  _set_listeners() {
    this.connect('changed::work-time-st', () => {
      for(const listener of this._listeners.timer_customization) {
        listener();
      }
    });
    this.connect('changed::break-time-st', () => {
      for(const listener of this._listeners.timer_customization) {
        listener();
      }
    });
    this.connect('changed::long-break-st', () => {
      for(const listener of this._listeners.timer_customization) {
        listener();
      }
    });
    this.connect('changed::sessions-long-break', () => {
      for(const listener of this._listeners.timer_customization) {
        listener();
      }
    });
  }

  /**
   *
   * Listener to pomodoro timer change settings
   * @param {string} event
   * @param {Function} callback
   *
   */
  change(event, callback) {
    this._listeners[event].push(callback);
  }
}
