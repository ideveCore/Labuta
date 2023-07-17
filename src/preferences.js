/* preferences.js
 *
 * Copyright 2023 francisco
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
import Template from './ui/preferences.blp' assert { type: 'uri' };

export default class Preferences extends Adw.PreferencesWindow {
  static {
    GObject.registerClass({
      Template,
      InternalChildren: [
        'select_theme',
        'switch_run_in_background',
        'set_break_time_after_4_pomodoris',
        'set_break_time',
        'set_work_time',
      ],
    }, this);
  }
  constructor(application) {
    super();
    this.Application = application;
    this.transient_for = this.Application.active_window;
    this.Application.settings.get_string('theme') === 'default' ?
      this._select_theme.set_selected(2) :
      this.Application.settings.get_string('theme') === 'dark' ?
        this._select_theme.set_selected(1) : this._select_theme.set_selected(0);
    this._switch_run_in_background.set_active(this.Application.settings.get_boolean('run-in-background'));
    this.work_time = this.Application.settings.get_int('work-time');
    this.break_time = this.Application.settings.get_int('break-time');
    this.break_after_4_pomodoris = this.Application.settings.get_int('break-time-after-4-pomodoris');
    this._set_work_time.set_value(Math.floor(this.work_time / 60) % 60);
    this._set_break_time.set_value(Math.floor(this.break_time / 60) % 60);
    this._set_break_time_after_4_pomodoris.set_value(Math.floor(this.break_after_4_pomodoris / 60) % 60);

  }
  _change_theme(_item) {
    const index = _item.get_selected();
    if (index === 0 || index === 1) {
      this.Application.settings.set_string('theme', index === 0 ? 'light' : 'dark');
    } else {
      this.Application.settings.set_string('theme', 'default');
    }
  }
  _on_boolean_state_set(widget, state) {
    const setting = widget.get_name()
    if (setting === 'run-in-background') {
      this.Application.settings.set_boolean(setting, state)
    }
  }
  _on_work_time_changed(_spin_button) {
    this.Application.settings.set_int('work-time', _spin_button.get_value() * 60)
  }
  _on_break_time_changed(_spin_button) {
    this.Application.settings.set_int('break-time', _spin_button.get_value() * 60)
  }
  _on_break_time_after_4_pomodoris_changed(_spin_button) {
    this.Application.settings.set_int('break-time-after-4-pomodoris', _spin_button.get_value() * 60)
  }
}
