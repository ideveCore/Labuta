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
import Template from './history-row.blp' assert { type: 'uri' };
import { format_time } from '../../utils.js';
/**
 * 
 * Create HistoryRow element
 * @class
 *
 */
export class HistoryRow extends Adw.ExpanderRow {
  static {
    GObject.registerClass({
      Template,
      InternalChildren: [
        'work_time',
        'break_time',
        'description',
        'sessions',
        'selection',
      ],
    }, this);
  }
  /**
   * Create HistoryRow element
   * @param {Object} history_data
   * @param {Gtk.ListBox} history_data.parent
   * @param {Function} history_data.on_select_row
   * @param {number} history_data.id 
   * @param {string} history_data.title 
   * @param {string} history_data.subtitle 
   * @param {number} history_data.work_time 
   * @param {number} history_data.break_time 
   * @param {number} history_data.day
   * @param {number} history_data.year
   * @param {string} history_data.description 
   * @param {number} history_data.sort_date
   * @param {number} history_data.sessions
   *
   */
  constructor({ parent, on_select_row, id, title, subtitle, work_time, break_time, description, sort_date, sessions }) {
    super();
    this._application = Gtk.Application.get_default();
    this.id = id;
    this._parent = parent
    this._on_select_row = on_select_row;
    this.title = title;
    this.sort_date = sort_date;
    this.work_time = work_time;
    this.break_time = break_time;
    this.set_title(title);
    this.set_subtitle(subtitle);
    this._work_time.set_text(format_time(this.work_time).toString());
    this._break_time.set_text(format_time(this.break_time).toString())
    this._description.set_subtitle(description);
    this._sessions.set_text(sessions.toString());
    this.selected = false;
  }

  /**
   *
   * Delete history row and data
   *
   */
  _on_continue_timer() {
    const timer = this._application.data.get_by_id(this.id);
    console.log(timer);
    const continue_timer = this._application.timer._on_handler_timer(timer[0]);
    if (continue_timer) {
      this._parent.remove(this);
    }
  }

  /**
   *
   * Delete history row and data
   *
   */
  _delete_row() {
    this._application.data.delete(this.id);
    this._parent.remove(this);
  }

  /**
   *
   * Called when select row
   * @param {*} check_button 
   *
   */
  _on_selected(check_button) {
    this.selected = check_button.get_active();
    this._on_select_row(this);
  }
}
