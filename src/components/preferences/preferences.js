/* preferences.js
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
import SoundPreferences from '../sound-preferences/sound-preferences.js';
import Template from './preferences.blp' assert { type: 'uri' };

/**
 *
 * Create Preferences page
 * @class
 *
 */
export default class Preferences extends Adw.PreferencesWindow {
  static {
    GObject.registerClass({
      Template,
      InternalChildren: [
        'switch_run_in_background',
        'switch_play_sounds',
        'switch_autostart',
        'set_history_duration',
        'set_work_time',
        'set_break_time',
        'set_long_break',
        'set_sessions_long_break',
      ],
    }, this);
  }
  constructor(application) {
    super({
      transient_for: application.get_active_window(),
    });
    this._application = application;
    this._set_settings_bind_states();
  }
  /**
   *
   * Set settings bind functions
   *
   */
  _set_settings_bind_states() {
    this._application.settings.bind(
      "run-in-background",
      this._switch_run_in_background,
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );
    this._application.settings.bind(
      "play-sounds",
      this._switch_play_sounds,
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );
    this._application.settings.bind(
      "autostart",
      this._switch_autostart,
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );
    this._application.settings.bind(
      "history-duration",
      this._set_history_duration,
      "value",
      Gio.SettingsBindFlags.DEFAULT,
    );
    this._application.settings.bind(
      "work-time-st",
      this._set_work_time,
      "value",
      Gio.SettingsBindFlags.DEFAULT,
    );
    this._application.settings.bind(
      "break-time-st",
      this._set_break_time,
      "value",
      Gio.SettingsBindFlags.DEFAULT,
    );
    this._application.settings.bind(
      "long-break-st",
      this._set_long_break,
      "value",
      Gio.SettingsBindFlags.DEFAULT,
    );
    this._application.settings.bind(
      "sessions-long-break",
      this._set_sessions_long_break,
      "value",
      Gio.SettingsBindFlags.DEFAULT,
    );
  }
  _open_sound_preferences(_target) {
    new SoundPreferences(this).present();
  }
}
