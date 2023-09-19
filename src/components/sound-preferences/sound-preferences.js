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
import Gst from 'gi://Gst';
import { Sound } from '../../utils.js';
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
        'start_time_sound',
        'start_time_uri_sound',
        'start_time_repeat_sound',
        'break_time_sound',
        'break_time_uri_sound',
        'break_time_repeat_sound',
        'finish_time_sound',
        'finish_time_repeat_sound',
        'finish_time_uri_sound',
      ],
    }, this);
  }
  constructor(application) {
    super({
      transient_for: application,
    });
    this._application = Gtk.Application.get_default();
    this._setup_start_time_sound()
    this._setup_break_time_sound()
    this._setup_finish_time_sound()
  }
  _setup_start_time_sound() {
    const settings = JSON.parse(this._application.settings.get_string('start-time-sound'))
    this._start_time_repeat_sound.set_value(settings.repeat)
    this._start_time_sound.set_subtitle(settings.type)
    this._start_time_uri_sound.set_subtitle(settings.type)
    this._start_time_uri_sound.set_title(settings.uri)
  }

  _play_start_time_sound() {
    new Sound({ settings: 'start-time-sound' })
  }

  _start_time_reset_settings() {
    this._application.settings.set_string('start-time-sound', JSON.stringify({ type: 'freedesktop', uri: 'message-new-instant', repeat: 1 }));
    this._setup_start_time_sound()
  }

  _start_time_select_sound() {
    const dialog = Gtk.FileDialog.new()
    dialog.open(this, null, (_dialog, _task) => {
      try {
        const settings = JSON.parse(this._application.settings.get_string('start-time-sound'));
        settings.uri = _dialog.open_finish(_task).get_uri();
        settings.type = 'file';
        this._application.settings.set_string('start-time-sound', JSON.stringify(settings));
        this._setup_start_time_sound();
      } catch (error) {
        console.log(error)
      }
    })
  }

  _on_start_time_sound_repeat_changed(_target) {
    const value = JSON.parse(this._application.settings.get_string('start-time-sound'))
    value.repeat = _target.get_value()
    this._application.settings.set_string('start-time-sound', JSON.stringify(value))
  }

  _setup_break_time_sound() {
    const settings = JSON.parse(this._application.settings.get_string('break-time-sound'))
    this._break_time_repeat_sound.set_value(settings.repeat)
    this._break_time_sound.set_subtitle(settings.type)
    this._break_time_uri_sound.set_subtitle(settings.type)
    this._break_time_uri_sound.set_title(settings.uri)
  }

  _play_break_time_sound() {
    new Sound({ settings: 'break-time-sound' })
  }

  _break_time_reset_settings() {
    this._application.settings.set_string('break-time-sound', JSON.stringify({ type: 'freedesktop', uri: 'complete', repeat: 1 }));
    this._setup_break_time_sound()
  }

  _break_time_select_sound() {
    const dialog = Gtk.FileDialog.new()
    dialog.open(this, null, (_dialog, _task) => {
      try {
        const settings = JSON.parse(this._application.settings.get_string('break-time-sound'));
        settings.uri = _dialog.open_finish(_task).get_uri();
        settings.type = 'file';
        this._application.settings.set_string('break-time-sound', JSON.stringify(settings));
        this._setup_break_time_sound();
      } catch (error) {
        console.log(error)
      }
    })
  }

  _on_break_time_sound_repeat_changed(_target) {
    const value = JSON.parse(this._application.settings.get_string('break-time-sound'))
    value.repeat = _target.get_value()
    this._application.settings.set_string('break-time-sound', JSON.stringify(value))
  }

  _setup_finish_time_sound() {
    const settings = JSON.parse(this._application.settings.get_string('finish-time-sound'))
    this._finish_time_repeat_sound.set_value(settings.repeat)
    this._finish_time_sound.set_subtitle(settings.type)
    this._finish_time_uri_sound.set_subtitle(settings.type)
    this._finish_time_uri_sound.set_title(settings.uri)
  }

  _play_finish_time_sound() {
    new Sound({ settings: 'finish-time-sound' })
  }

  _finish_time_reset_settings() {
    this._application.settings.set_string('finish-time-sound', JSON.stringify({ type: 'freedesktop', uri: 'alarm-clock-elapsed', repeat: 1 }));
    this._setup_finish_time_sound()
  }

  _finish_time_select_sound() {
    const dialog = Gtk.FileDialog.new()
    dialog.open(this, null, (_dialog, _task) => {
      try {
        const settings = JSON.parse(this._application.settings.get_string('finish-time-sound'));
        settings.uri = _dialog.open_finish(_task).get_uri();
        settings.type = 'file';
        this._application.settings.set_string('finish-time-sound', JSON.stringify(settings));
        this._setup_finish_time_sound();
      } catch (error) {
        console.log(error)
      }
    })
  }

  _on_finish_time_sound_repeat_changed(_target) {
    const value = JSON.parse(this._application.settings.get_string('finish-time-sound'))
    value.repeat = _target.get_value()
    this._application.settings.set_string('finish-time-sound', JSON.stringify(value))
  }
}

