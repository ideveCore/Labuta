/* pomodoro-item.js
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

 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Db_item } from "./db.js";

export class PomodoroItem {
  /**
   *
   * Create a instance of Pomodoro item
   * @param {object} params
   * @param {application_db_manager} params.db_manager
   * @param {pomodoro_time_utils} params.time_utils
   *
   */
  constructor({ db_manager, time_utils }) {
    this._data = db_manager;
    this._time_utils = time_utils;
    this._item = null;
    this.default_item();
  }

  /**
   *
   * Set pomodoro item
   * @param {Db_item} db_item
   *
   */
  set set(db_item) {
    const new_item = Object.entries(db_item)
    new_item.forEach((item) => {
      this._item[item[0]] = item[1];
    })
  }

  /**
   *
   * Return pomodoro item
   * @returns {this._item}
   */
  get get() {
    return this._item;
  }

  /**
   *
   * Save pomodoro item
   * @returns {this._item}
   *
   */
  save() {
    const current_item = this.get;
    if(this._item.title === '') {
      this._item.title = current_item.title ? current_item.title : `${_('Started at')} ${this._time_utils.time}`;
    }
    this._item.day = this._time_utils.day;
    this._item.day_of_month = this._time_utils.day_of_month;
    this._item.year = this._time_utils.year;
    this._item.week = this._time_utils.week;
    this._item.month = this._time_utils.month;
    this._item.display_date = this._time_utils.display_date;
    this._item.timestamp = this._time_utils.timestamp;
    this._item = this._data.save(this._item);
    return this._item;
  }

  /**
   *
   * delete pomodoro item
   * @returns {Db_item}
   *
   */
  delete() {
    if(this._item.id) {
      this._data.delete(this._item.id);
    }
    this.default_item();
    return this._item;
  }

  /**
   *
   * Update pomodoro item
   * @returns {Db_item}
   *
   */
  update() {
    this._item = this._data.update(this._item);
    return this._item;
  }

  /**
   *
   * Return the default pomodoro item
   *
   */
  default_item() {
    this._item = new Db_item({
      id: null,
      day: 0,
      week: 0,
      year: 0,
      month: 0,
      title: '',
      sessions: 0,
      timestamp: 0,
      work_time: 0,
      break_time: 0,
      description: '',
      day_of_month: 0,
      display_date: '',
    });
  }
}
