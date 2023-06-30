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
import Adw from 'gi://Adw';
import { settings } from './stores.js';
import { set_theme } from './utils.js';

export const PomodoroPreferences = GObject.registerClass({
  GTypeName: "PomodoroPreferences",
  Template: 'resource:///io/gitlab/idevecore/Pomodoro/ui/preferences.ui',
  InternalChildren: ['run_in_background', 'theme'],
}, class PomodoroPreferences extends Adw.PreferencesWindow {
  constructor() {
    super();
    this._run_in_background.set_active(settings.get_boolean('run-in-background'));
    settings.get_string('theme') === 'default' ?
      this._theme.set_selected(2) :
      settings.get_string('theme') === 'dark' ?
        this._theme.set_selected(1) : this._theme.set_selected(0)
    this._theme.connect('notify', (sender, e) => {
      if (e.get_name() === 'selected-item') {
        this.change_theme(this._theme.get_selected())
      }
    })
  }

  change_theme(index) {
    if (index === 0 || index === 1) {
      settings.set_string('theme', index === 0 ? 'light' : 'dark')
    } else {
      settings.set_string('theme', 'default')
    }
    set_theme()
  }

  on_boolean_state_set(widget, state) {
    const setting = widget.get_name()
    if (setting === 'run-in-background') {
      settings.set_boolean(setting, state)
    }
  }
})
