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
import GLib from 'gi://GLib';
import Template from './history-details.blp' assert { type: 'uri' };
import { create_sort_date, format_time } from '../../utils.js';

/**
 * 
 * Create HistoryDetails element
 * @class
 *
 */
export default class HistoryDetails extends Gtk.ListBoxRow {
  static {
    GObject.registerClass({
      Template,
      GTypeName: 'HistoryDetails',
      InternalChildren: [
        'title',
        'date',
        'work_time',
        'break_time',
        'description',
        'sessions',
      ],
    }, this);
  }
  /**
   * Create HistoryDetails element
   * @param {Object} history_data
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
  constructor({ parent, id, title, subtitle, work_time, break_time, description, sessions }) {
    super();
    this._application = Gtk.Application.get_default();
    this._id = id;
    this._parent = parent
    this._title.set_text(title);
    this._date.set_text(subtitle);
    this._work_time.set_text(format_time(work_time).toString());
    this._break_time.set_text(format_time(break_time).toString())
    this._description.set_subtitle(description);
    this._sessions.set_text(sessions.toString());
  }

  /**
   *
   * Continue timer
   *
   */
  _on_continue_timer() {
    const timer = this._application.data.get_by_id(this._id)[0];
    if (this._application.Timer.timer_state !== 'running' && this._application.Timer.timer_state !== 'paused') {
      const current_date = GLib.DateTime.new_now_local();
      timer.timestamp = Math.floor(create_sort_date(null, null, null) / 1000);
      timer.day = current_date.get_day_of_year();
      timer.day_of_month = current_date.get_day_of_month();
      timer.year = current_date.get_year();
      timer.week = current_date.get_week_of_year();
      timer.month = current_date.get_month();
      timer.display_date = this._get_date();
      this._application.Timer.start(this._application.data.update(timer));
      this._parent.close();
    }
  }
  /**
   *
   * @returns {string} // Return the formated current date
   *
   */
  _get_date() {
    const current_date = GLib.DateTime.new_now_local();
    const day_of_week = current_date.format('%A');
    const day_of_month = current_date.get_day_of_month();
    const month_of_year = current_date.format('%B');
    const year = current_date.get_year();
    return `${day_of_week}, ${day_of_month} ${_("of")} ${month_of_year} ${_("of")} ${year}`
  }
}
