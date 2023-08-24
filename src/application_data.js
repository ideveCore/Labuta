/* application_data.js
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

import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import { Database, Query_builder, Db_item, Pomodoro_query } from './db.js'

/**
 *
 * Manage application data
 * @class
 *
 */

export default class Application_data {
  constructor() {
    this._db = new Database();
    this._data = [];
  }

  /**
   *
   * Setup database
   * @returns {Application_data}
   *
   */
  setup() {
    this._db.setup();
    return this
  }

  /**
   *
   * Save data in database
   * @param {Db_item} data 
   * @returns {*}
   * @example
   * returns Db_item or null
   *
   */
  save(data) {
    if (!data) return null
    return this._db.save(data);
  }

  /**
   *
   * Return the data from database
   * @returns {Db_item[]}
   *
   */
  get() {
    const data_dir = GLib.get_user_config_dir();
    const destination = GLib.build_filenamev([data_dir, 'data.json'])
    const destination_file = Gio.File.new_for_path(destination)

    try {
      const [, contents] = destination_file.load_contents(null);
      const decoder = new TextDecoder('utf-8');
      const data = JSON.parse(decoder.decode(contents));
      data.forEach((item) => {
        const db_item = new Db_item({
          id: null,
          title: item.title,
          description: item.description,
          work_time: item.work_time,
          break_time: item.break_time,
          day: item.date.day,
          day_of_month: item.date.day_of_month,
          week: item.date.week,
          year: item.date.year,
          month: item.date.month,
          display_date: item.date.display_date,
          sessions: item.counts,
        });
        this.save(db_item)
      })
      destination_file.delete(null);
      this._data = this._db.query(this._get_all_query())
    } catch (error) {
      this._data = this._db.query(this._get_all_query());
    }
    return this._data
  }

  /**
   *
   * Update item in database
   * @param {Db_item} data
   * @returns {*}
   * @example
   * Returns null or item updated
   */
  update(data) {
    if (!data) return null;
    return this._db.update(data);
  }

  /**
   *
   * Delete item in database
   * @param {number} id
   * @returns {null}
   */
  delete(id) {
    if (!id) return null
    return this._db.delete(id);
  }

  /**
   *
   * Returns the database query
   * @returns {Pomodoro_query}
   *
   */
  _get_all_query() {
    return new Query_builder().get_all().build();
  }
}
