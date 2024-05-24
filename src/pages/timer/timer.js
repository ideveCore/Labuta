/* timer.js
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
import { TimerControls } from '../../components/timer-controls/timer-controls.js';
import Template from './timer.blp' assert { type: 'uri' };

/**
 *
 * Create timer page
 * @extends {Adw.Bin}
 * @class
 *
 */
export class Timer extends Adw.Bin {
  static {
    GObject.registerClass({
      Template,
      GTypeName: 'Timer',
      InternalChildren: [
        'timer_container',
        'display_timer',
        // 'title_entry',
        // 'description_entry',
      ]
    }, this);
  }

  /**
   *
   * Create a instance of Timer
   * @param { object } params
   * @param { Adw.Application  } params.application
   * @param {Gtk.Box} params.display_timer
   *
   */
  constructor({ application, display_timer }) {
    super();
    this._timer = application.utils.timer;
    this._pomodoro_item = application.utils.pomodoro_item;

    this._timer.connect('start', ({ data, pomodoro_item }) => {
      // this._title_entry.set_text(pomodoro_item.title);
      // this._description_entry.set_text(pomodoro_item.description);
      // this._title_entry.editable = false;
      // this._description_entry.editable = false;
    });
    this._timer.connect('stop', ({ data, pomodoro_item }) => {
      // this._title_entry.editable = true;
      // this._description_entry.editable = true;
      // this._title_entry.set_text('');
      // this._description_entry.set_text('');
    });
    this._timer_container.append(new TimerControls({ application }));
    this._display_timer.append(display_timer);
  }

  /**
   *
   * Title changes listener
   * @param {Adw.EntryRow} target 
   *
   */
  _on_title_changed(target) {
    this._pomodoro_item.set = { title: target.get_text() };
  }

  /**
   *
   * Description changes listener
   * @param {Adw.EntryRow} target 
   *
   */
  _on_description_changed(target) {
    this._pomodoro_item.set = { description: target.get_text() };
  }
}
