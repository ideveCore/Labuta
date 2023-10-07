/* history-row.js
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
import Template from './history-details.blp' assert { type: 'uri' };

/**
 * 
 * Create HistoryDetails element
 * @class
 * @extends {Gtk.Boxc}
 *
 */
export class HistoryDetails extends Gtk.Box {
  static {
    GObject.registerClass({
      Template,
      GTypeName: 'HistoryDetails',
      InternalChildren: [
        'date',
        'work_time',
        'break_time',
        'sessions',
        'toast_overlay',
      ],
    }, this);
  }
  /**
   * create history details
   * @param {Object} history_data
   * @param {Adw.Application} history_data.application
   * @param {Gtk.ListBox} history_data.parent
   * @param {number} history_data.id
   * @param {string} history_data.title
   * @param {string} history_data.subtitle
   * @param {number} history_data.work_time
   * @param {number} history_data.break_time
   * @param {string} history_data.description
   * @param {number} history_data.sessions
   *
   */
  constructor({ application, parent, id, subtitle, work_time, break_time, sessions, title, description }) {
    super();
    this._application = application;
    this._format_time = application.utils.format_time;
    this._pomodoro_item = application.utils.pomodoro_item;
    this._timer = application.utils.timer;
    this.title = title;
    this.description = description;
    this._id = id;
    this._parent = parent
    this._date.set_text(subtitle);
    this._work_time.set_text(this._format_time(work_time).toString());
    this._break_time.set_text(this._format_time(break_time).toString())
    this._sessions.set_text(sessions.toString());
  }

  /**
   *
   * Continue timer
   *
   */
  _on_continue_timer() {
    const timer_state = this._timer.get_data().timer_state;
    if (timer_state !== 'running' && timer_state !== 'paused') {
      this._pomodoro_item.set = { title: this.title, description: this.description }
      this._timer.start();
      this._parent.close();
    } else {
      this._toast_overlay.add_toast(new Adw.Toast({
        title: _("Timer already in progress"),
      }));
    }
  }
}
