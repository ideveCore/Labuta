/* alarm-preferences.js
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
import { Alarm } from '../../utils.js';
import Template from './alarm-preferences.blp' assert { type: 'uri' };

/**
 *
 * Create Alarm Preferences page
 * @class
 *
 */
export default class AlarmPreferences extends Adw.Window {
  static {
    GObject.registerClass({
      GTypeName: 'AlarmPreferences',
      Template,
      InternalChildren: [
        'timer_start_alarm',
        'uri_timer_start_alarm',
        'repeat_timer_start_alarm',
        'timer_break_alarm',
        'uri_timer_break_alarm',
        'repeat_timer_break_alarm',
        'timer_finish_alarm',
        'uri_timer_finish_alarm',
        'repeat_timer_finish_alarm',
      ],
    }, this);
  }
  constructor(application) {
    super({
      transient_for: application,
    });
    this._application = Gtk.Application.get_default();
    this._setup_timer_alarms();
    this._alarm = new Alarm();
  }

  /**
   *
   * Setup timer alarms
   *
   */
  _setup_timer_alarms() {
    const timer_start_alarm = JSON.parse(this._application.settings.get_string('timer-start-alarm'));
    const timer_break_alarm = JSON.parse(this._application.settings.get_string('timer-break-alarm'));
    const timer_finish_alarm = JSON.parse(this._application.settings.get_string('timer-finish-alarm'));
    this._repeat_timer_start_alarm.set_value(timer_start_alarm.repeat);
    this._timer_start_alarm.set_subtitle(timer_start_alarm.type);
    this._uri_timer_start_alarm.set_title(timer_start_alarm.uri);
    this._uri_timer_start_alarm.set_subtitle(timer_start_alarm.type)
    this._repeat_timer_break_alarm.set_value(timer_break_alarm.repeat);
    this._timer_break_alarm.set_subtitle(timer_break_alarm.type);
    this._uri_timer_break_alarm.set_title(timer_break_alarm.uri);
    this._uri_timer_break_alarm.set_subtitle(timer_break_alarm.type)
    this._repeat_timer_finish_alarm.set_value(timer_finish_alarm.repeat);
    this._timer_finish_alarm.set_subtitle(timer_finish_alarm.type);
    this._uri_timer_finish_alarm.set_title(timer_finish_alarm.uri);
    this._uri_timer_finish_alarm.set_subtitle(timer_finish_alarm.type)
  }

  _play_timer_start_alarm() {
    this._alarm.play('timer-start-alarm');
  }

  _reset_timer_start_settings() {
    this._application.settings.set_string('timer-start-alarm', JSON.stringify({ type: 'freedesktop', uri: 'message-new-instant', repeat: 1 }));
    this._setup_timer_alarms();
  }

  _select_timer_start_alarm() {
    const dialog = Gtk.FileDialog.new();
    dialog.open(this, null, (_dialog, _task) => {
      try {
        const settings = JSON.parse(this._application.settings.get_string('timer-start-alarm'));
        settings.uri = _dialog.open_finish(_task).get_uri();
        settings.type = 'file';
        this._application.settings.set_string('timer-start-alarm', JSON.stringify(settings));
        this._setup_timer_alarms();
      } catch (error) {
        console.log(error);
      }
    })
  }

  _on_repeat_timer_start_alarm_changed(_target) {
    const value = JSON.parse(this._application.settings.get_string('timer-start-alarm'));
    value.repeat = _target.get_value();
    this._application.settings.set_string('timer-start-alarm', JSON.stringify(value));
  }

  _setup_break_time_alarm() {
    const settings = JSON.parse(this._application.settings.get_string('break-time-sound'))
    this._break_time_repeat_sound.set_value(settings.repeat)
    this._break_time_uri_sound.set_subtitle(settings.type)
    this._break_time_sound.set_subtitle(settings.type)
    this._break_time_uri_sound.set_title(settings.uri)
  }

  _play_timer_break_alarm() {
    this._alarm.play('timer-break-alarm');
  }

  _reset_timer_break_settings() {
    this._application.settings.set_string('timer-break-alarm', JSON.stringify({ type: 'freedesktop', uri: 'complete', repeat: 1 }));
    this._setup_timer_alarms();
  }

  _select_timer_break_alarm() {
    const dialog = Gtk.FileDialog.new();
    dialog.open(this, null, (_dialog, _task) => {
      try {
        const settings = JSON.parse(this._application.settings.get_string('timer-break-alarm'));
        settings.uri = _dialog.open_finish(_task).get_uri();
        settings.type = 'file';
        this._application.settings.set_string('timer-break-alarm', JSON.stringify(settings));
        this._setup_timer_alarms();
      } catch (error) {
        console.log(error);
      }
    })
  }

  _on_repeat_timer_break_alarm_changed(_target) {
    const value = JSON.parse(this._application.settings.get_string('timer-break-alarm'));
    value.repeat = _target.get_value();
    this._application.settings.set_string('timer-break-alarm', JSON.stringify(value));
  }

  _setup_finish_time_alarm() {
    const settings = JSON.parse(this._application.settings.get_string('finish-time-sound'))
    this._finish_time_repeat_sound.set_value(settings.repeat)
    this._finish_time_sound.set_subtitle(settings.type)
    this._finish_time_uri_sound.set_subtitle(settings.type)
    this._finish_time_uri_sound.set_title(settings.uri)
  }

  _play_timer_finish_alarm() {
    this._alarm.play('timer-finish-alarm');
  }

  _reset_timer_finish_settings() {
    this._application.settings.set_string('timer-finish-alarm', JSON.stringify({ type: 'freedesktop', uri: 'alarm-clock-elapsed', repeat: 1 }));
    this._setup_timer_alarms();
  }

  _select_timer_finish_alarm() {
    const dialog = Gtk.FileDialog.new();
    dialog.open(this, null, (_dialog, _task) => {
      try {
        const settings = JSON.parse(this._application.settings.get_string('timer-finish-alarm'));
        settings.uri = _dialog.open_finish(_task).get_uri();
        settings.type = 'file';
        this._application.settings.set_string('timer-finish-alarm', JSON.stringify(settings));
        this._setup_timer_alarms();
      } catch (error) {
        console.log(error);
      }
    })
  }

  _on_repeat_timer_finish_alarm_changed(_target) {
    const value = JSON.parse(this._application.settings.get_string('timer-finish-alarm'));
    value.repeat = _target.get_value();
    this._application.settings.set_string('timer-finish-alarm', JSON.stringify(value));
  }
}

