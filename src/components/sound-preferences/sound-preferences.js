/* sound-preferences.js
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
import Gio from 'gi://Gio';
import Template from './sound-preferences.blp' assert { type: 'uri' };

/**
 *
 * Create Sound Preferences page
 * @class
 *
 */
export default class SoundPreferences extends Adw.Window {
  static {
    GObject.registerClass({
      GTypeName: 'SoundPreferences',
      Template,
      InternalChildren: [
        'start_time_repeat_sound',
        'break_time_repeat_sound',
        'finish_time_repeat_sound',
      ],
    }, this);
  }
  constructor(application) {
    super({
      transient_for: application,
    });
    this._application = Gtk.Application.get_default();
  }
  _play_start_time_sound() {
    this._application._play_sound({ name: 'message-new-instant', cancellable: null, iter: this._start_time_repeat_sound.get_value() });
  }
  _play_break_time_sound() {
    this._application._play_sound({ name: 'complete', cancellable: null, iter: this._break_time_repeat_sound.get_value() });
  }
  _play_finish_time_sound() {
    this._application._play_sound({ name: 'alarm-clock-elapsed', cancellable: null, iter: this._finish_time_repeat_sound.get_value() });
  }
}

