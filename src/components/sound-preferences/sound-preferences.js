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
import { Sound } from '../../utils.js';
import GSettings from '../../gsettings.js';
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
        'timer_start_sound',
        'uri_timer_start_sound',
        'repeat_timer_start_sound',
        'timer_break_sound',
        'uri_timer_break_sound',
        'repeat_timer_break_sound',
        'timer_finish_sound',
        'uri_timer_finish_sound',
        'repeat_timer_finish_sound',
      ],
    }, this);
  }
  constructor(application) {
    super({
      transient_for: application,
    });
    this._settings = new GSettings();
    this._setup_timer_sounds();
    this._sound = new Sound();
  }

  /**
   *
   * Setup timer sounds
   *
   */
  _setup_timer_sounds() {
    const timer_start_sound = JSON.parse(this._settings.get_string('timer-start-sound'));
    const timer_break_sound = JSON.parse(this._settings.get_string('timer-break-sound'));
    const timer_finish_sound = JSON.parse(this._settings.get_string('timer-finish-sound'));
    console.log(timer_start_sound.uri);
    this._repeat_timer_start_sound.set_value(timer_start_sound.repeat);
    this._timer_start_sound.set_subtitle(timer_start_sound.type);
    this._uri_timer_start_sound.set_title(timer_start_sound.uri);
    this._uri_timer_start_sound.set_subtitle(timer_start_sound.type)
    this._repeat_timer_break_sound.set_value(timer_break_sound.repeat);
    this._timer_break_sound.set_subtitle(timer_break_sound.type);
    this._uri_timer_break_sound.set_title(timer_break_sound.uri);
    this._uri_timer_break_sound.set_subtitle(timer_break_sound.type)
    this._repeat_timer_finish_sound.set_value(timer_finish_sound.repeat);
    this._timer_finish_sound.set_subtitle(timer_finish_sound.type);
    this._uri_timer_finish_sound.set_title(timer_finish_sound.uri);
    this._uri_timer_finish_sound.set_subtitle(timer_finish_sound.type)
  }

  _play_timer_start_sound() {
    this._sound.play('timer-start-sound');
  }

  _reset_timer_start_settings() {
    this._settings.set_string('timer-start-sound', JSON.stringify({ type: 'freedesktop', uri: 'message-new-instant', repeat: 1 }));
    this._setup_timer_sounds();
  }

  _select_timer_start_sound() {
    const dialog = Gtk.FileDialog.new();
    dialog.open(this, null, (_dialog, _task) => {
      try {
        const settings = JSON.parse(this._settings.get_string('timer-start-sound'));
        settings.uri = _dialog.open_finish(_task).get_uri();
        settings.type = 'file';
        this._settings.set_string('timer-start-sound', JSON.stringify(settings));
        this._setup_timer_sounds();
      } catch (error) {
        console.log(error);
      }
    })
  }

  _on_repeat_timer_start_sound_changed(_target) {
    const value = JSON.parse(this._settings.get_string('timer-start-sound'));
    value.repeat = _target.get_value();
    this._settings.set_string('timer-start-sound', JSON.stringify(value));
  }

  _setup_break_time_sound() {
    const settings = JSON.parse(this._settings.get_string('break-time-sound'))
    this._break_time_repeat_sound.set_value(settings.repeat)
    this._break_time_uri_sound.set_subtitle(settings.type)
    this._break_time_sound.set_subtitle(settings.type)
    this._break_time_uri_sound.set_title(settings.uri)
  }

  _play_timer_break_sound() {
    this._sound.play('timer-break-sound');
  }

  _reset_timer_break_settings() {
    this._settings.set_string('timer-break-sound', JSON.stringify({ type: 'freedesktop', uri: 'complete', repeat: 1 }));
    this._setup_timer_sounds();
  }

  _select_timer_break_sound() {
    const dialog = Gtk.FileDialog.new();
    dialog.open(this, null, (_dialog, _task) => {
      try {
        const settings = JSON.parse(this._settings.get_string('timer-break-sound'));
        settings.uri = _dialog.open_finish(_task).get_uri();
        settings.type = 'file';
        this._settings.set_string('timer-break-sound', JSON.stringify(settings));
        this._setup_timer_sounds();
      } catch (error) {
        console.log(error);
      }
    })
  }

  _on_repeat_timer_break_sound_changed(_target) {
    const value = JSON.parse(this._settings.get_string('timer-break-sound'));
    value.repeat = _target.get_value();
    this._settings.set_string('timer-break-sound', JSON.stringify(value));
  }

  _setup_finish_time_sound() {
    const settings = JSON.parse(this._settings.get_string('finish-time-sound'))
    this._finish_time_repeat_sound.set_value(settings.repeat)
    this._finish_time_sound.set_subtitle(settings.type)
    this._finish_time_uri_sound.set_subtitle(settings.type)
    this._finish_time_uri_sound.set_title(settings.uri)
  }

  _play_timer_finish_sound() {
    this._sound.play('timer-finish-sound');
  }

  _reset_timer_finish_settings() {
    this._settings.set_string('timer-finish-sound', JSON.stringify({ type: 'freedesktop', uri: 'alarm-clock-elapsed', repeat: 1 }));
    this._setup_timer_sounds();
  }

  _select_timer_finish_sound() {
    const dialog = Gtk.FileDialog.new();
    dialog.open(this, null, (_dialog, _task) => {
      try {
        const settings = JSON.parse(this._settings.get_string('timer-finish-sound'));
        settings.uri = _dialog.open_finish(_task).get_uri();
        settings.type = 'file';
        this._settings.set_string('timer-finish-sound', JSON.stringify(settings));
        this._setup_timer_sounds();
      } catch (error) {
        console.log(error);
      }
    })
  }

  _on_repeat_timer_finish_sound_changed(_target) {
    const value = JSON.parse(this._settings.get_string('timer-finish-sound'));
    value.repeat = _target.get_value();
    this._settings.set_string('timer-finish-sound', JSON.stringify(value));
  }
}

