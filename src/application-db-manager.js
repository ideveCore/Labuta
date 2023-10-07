/* application-db-manager.js
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

import { Database, Query_builder, Db_item, Pomodoro_query } from './db.js';
import Gio from 'gi://Gio';

/**
 *
 * Manage application database
 * @class
 *
 */
export class ApplicationDbManager {

  /**
   *
   * Create ApplicationDbManager instance
   * @param {object} params
   * @param {Gio.Settings} params.settings
   *
   */
  constructor({ settings }) {
    this._db = new Database({ settings });
    this.data = null;
    this._db.setup();
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
    this.data = null;
    return this._db.save(data);
  }

  /**
   *
   * Return the data from database
   * @returns {Db_item[]}
   *
   */
  get() {
    if (!this.data) this.data = this._db.query(this._get_all_query());
    return this.data;
  }

  /**
   *
   * Get db item by id
   * @param {number} id
   * @returns {null|Db_item}
   *
   */
  get_by_id(id) {
    if (!id) return null;
    return this._db.query(this._get_by_id_query(id));
  }

  /**
   *
   * Get db item by day
   * @param {number} day
   * @returns {null|Db_item}
   *
   */
  get_by_day(day) {
    if (!day) return null;
    return this._db.query(this._get_by_day_query(day));
  }

  /**
   *
   * Get db item by week
   * @param {number} week
   * @returns {null|Db_item}
   *
   */
  get_by_week(week) {
    if (!week) return null;
    return this._db.query(this._get_by_week_query(week));
  }

  /**
   *
   * Get db item by month
   * @param {number} month
   * @returns {null|Db_item}
   *
   */
  get_by_month(month) {
    if (!month) return null;
    return this._db.query(this._get_by_month_query(month));
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
    this.data = null;
    return this._db.update(data);
  }

  /**
   *
   * Delete item in database
   * @param {number} id
   * @returns {null}
   */
  delete(id) {
    if (!id) return null;
    this.data = null;
    return this._db.delete(id);
  }

  /**
   *
   * Delete all item from table
   *
   */
  delete_all() {
    this._db.delete_all();
    this.data = null;
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

  /**
   *
   * Return the query for search by id in database
   * @param {number} id
   * return {null|Pomodoro_query}
   *
   */
  _get_by_id_query(id) {
    const query = new Query_builder();
    query.with_id(id);
    return query.build();
  }

  /**
   *
   * Return the query for search by day in database
   * @param {number} day
   * return {null|Pomodoro_query}
   *
   */
  _get_by_day_query(day) {
    const query = new Query_builder();
    query.with_day(day);
    return query.build();
  }

  /**
   *
   * Return the query for search by week in database
   * @param {number} week
   * return {null|Pomodoro_query}
   *
   */
  _get_by_week_query(week) {
    const query = new Query_builder();
    query.with_week(week);
    return query.build();
  }

  /**
   *
   * Return the query for search by month in database
   * @param {number} month
   * return {null|Pomodoro_query}
   *
   */
  _get_by_month_query(month) {
    const query = new Query_builder();
    query.with_month(month);
    return query.build();
  }
}
