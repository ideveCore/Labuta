/* db.js
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
import Gda from 'gi://Gda';

/**
 *
 * Create the db item object
 * @class
 *
 */

export class Db_item {
  /**
   *
   * Create a new instance of db item
   * @param {Object} item
   * @param {number} item.id
   * @param {string} item.title
   * @param {description} item.description
   * @param {number} item.work_time
   * @param {number} item.day
   * @param {number} item.break_time
   * @param {number} item.day_of_month
   * @param {number} item.year
   * @param {number} item.week
   * @param {number} item.month
   * @param {string} item.display_date
   * @param {number} item.sessions
   */
  constructor({ id, title, description, work_time, break_time, day, day_of_month, year, week, month, display_date, sessions }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.work_time = work_time;
    this.break_time = break_time;
    this.day = day;
    this.day_of_month = day_of_month;
    this.year = year;
    this.week = week;
    this.month = month;
    this.display_date = display_date;
    this.sessions = sessions;
  }
}

/**
 * Create pomodoro query for db
 * @class
 *
 */
export class Pomodoro_query {
  /**
   * Create new instatece of pomodoro query statement 
   * @param {*} statement
   *
   */
  constructor(statement) {
    this.statement = statement;
  }
}

/**
 *
 * @param {*} builder
 * @param {*} value
 * @returns {number}
 *
 */
const add_expr_value = (builder, value) => (builder.add_expr_value(value));

/**
 *
 * Create new instance of db query
 * @class
 *
 */
export class Query_builder {
  constructor() {
    this._conditions = [];
    this._builder = Gda.SqlBuilder.new(
      Gda.SqlStatementType.SELECT,
    )
    this._builder.select_add_field('id', 'history', 'id')
    this._builder.select_add_field('title', 'history', 'title')
    this._builder.select_add_field('description', 'history', 'description')
    this._builder.select_add_field('work_time', 'history', 'work_time')
    this._builder.select_add_field('break_time', 'history', 'break_time')
    this._builder.select_add_field('day', 'history', 'day')
    this._builder.select_add_field('day_of_month', 'history', 'day_of_month')
    this._builder.select_add_field('year', 'history', 'year')
    this._builder.select_add_field('week', 'history', 'week')
    this._builder.select_add_field('month', 'history', 'month')
    this._builder.select_add_field('display_date', 'history', 'display_date')
    this._builder.select_add_field('sessions', 'history', 'sessions')

    this._builder.select_add_target('history', null)
  }
  /**
   *
   * Return all queries from database
   * @returns {Query_builder}
   *
   */
  get_all() {
    return this
  }
  /**
   * returns querybuilder cond id
   * @param {*} [id=null] 
   * @returns {Query_builder}
   *
   */
  with_id(id = null) {
    if (id) {
      return this._conditions.push(
        this._builder.add_cond(
          Gda.SqlOperatorType.EQ,
          this._builder.add_field_id('id', 'history'),
          add_expr_value(this._builder, id),
          0,
        )
      )
    }
    return this
  }
  /**
   * return instance of Pomodoro_query
   * @returns {Pomodoro_query}
   */
  build() {
    if (this._conditions.length > 0) {
      this._builder.set_where(this._builder.add_cond_v(Gda.SqlOperatorType.AND, this._conditions))
    }
    return new Pomodoro_query(this._builder.get_statement())
  }
}

/**
 *
 * Setup class for database operations
 * @class
 *
 */
export class Database {
  constructor() {
    this.data_dir = GLib.get_user_config_dir();
    this._connection = new Gda.Connection({
      provider: Gda.Config.get_provider('SQLite'),
      cnc_string: `DB_DIR=${this.data_dir};DB_NAME=pomodoro`,
    })
    this._connection.open()
  }
  setup() {
    if (!this._connection || !this._connection.is_opened()) return;

    this._connection.execute_non_select_command(`
      create table if not exists history
      (
          id            integer not null constraint pomodoro_pk primary key autoincrement,
          title         text not null,
          description   text not null,
          work_time     integer not null,
          break_time    integer not null,
          day           integer not null,
          day_of_month  integer not null,
          year          integer not null,
          week          integer not null,
          month         integer not null,
          display_date  text not null,
          sessions      integer not null
      );
    `);
    this._connection.execute_non_select_command(`
      create unique index if not exists pomodoro_id_uindex on history (id);
    `);
  }
  /**
   *
   * Save item in database
   * @param {Db_item} db_item 
   * @returns {*}
   * @example
   * returns null or item saved in database
   *
   */
  save(db_item) {
    if (!this._connection.is_opened()) return;

    const builder = Gda.SqlBuilder.new(Gda.SqlStatementType.INSERT);
    builder.set_table('history');
    builder.add_field_value_as_gvalue('title', db_item.title);
    builder.add_field_value_as_gvalue('description', db_item.description);
    builder.add_field_value_as_gvalue('work_time', db_item.work_time);
    builder.add_field_value_as_gvalue('break_time', db_item.break_time);
    builder.add_field_value_as_gvalue('day', db_item.day);
    builder.add_field_value_as_gvalue('day_of_month', db_item.day_of_month);
    builder.add_field_value_as_gvalue('year', db_item.year);
    builder.add_field_value_as_gvalue('week', db_item.week);
    builder.add_field_value_as_gvalue('month', db_item.month);
    builder.add_field_value_as_gvalue('display_date', db_item.display_date);
    builder.add_field_value_as_gvalue('sessions', db_item.sessions);
    const [_, row] = this._connection.statement_execute_non_select(builder.get_statement(), null);
    const id = row.get_nth_holder(0).get_value();

    if (!id) return null;

    const item = new Db_item({
      id: id,
      title: db_item.title,
      description: db_item.description,
      work_time: db_item.work_time,
      break_time: db_item.break_time,
      day: db_item.day,
      day_of_month: db_item.day_of_month,
      year: db_item.year,
      month: db_item.month,
      week: db_item.week,
      display_date: db_item.display_date,
      sessions: db_item.sessions,
    });
    return item;
  }
  /**
   *
   * Delete item from database
   * @param {number} id 
   * @returns {null}
   */
  delete(id) {
    if (!this._connection.is_opened()) return;
    const builder = Gda.SqlBuilder.new(Gda.SqlStatementType.DELETE);
    builder.set_table('history')
    builder.set_where(
      builder.add_cond(Gda.SqlOperatorType.EQ, builder.add_field_id('id', 'history'), add_expr_value(builder, id), 0),
    )
    this._connection.statement_execute_non_select(builder.get_statement(), null)
  }
  /**
   * update item from database
   * @param {Db_item} db_item 
   * @returns {*}
   * @example
   * returns null or item updated in database table
   *
   */
  update(db_item) {
    if (!this._connection.is_opened()) return;

    const builder = Gda.SqlBuilder.new(Gda.SqlStatementType.UPDATE);

    builder.set_table('history');
    builder.add_field_value_as_gvalue('title', db_item.title);
    builder.add_field_value_as_gvalue('description', db_item.description);
    builder.add_field_value_as_gvalue('work_time', db_item.work_time);
    builder.add_field_value_as_gvalue('break_time', db_item.break_time);
    builder.add_field_value_as_gvalue('day', db_item.day);
    builder.add_field_value_as_gvalue('day_of_month', db_item.day_of_month);
    builder.add_field_value_as_gvalue('year', db_item.year);
    builder.add_field_value_as_gvalue('week', db_item.week);
    builder.add_field_value_as_gvalue('month', db_item.month);
    builder.add_field_value_as_gvalue('display_date', db_item.display_date);
    builder.add_field_value_as_gvalue('sessions', db_item.sessions);

    builder.set_where(
      builder.add_cond(
        Gda.SqlOperatorType.EQ,
        builder.add_field_id('id', 'history'),
        add_expr_value(builder, db_item.id),
        0,
      ),
    );

    this._connection.statement_execute_non_select(builder.get_statement(), null);

    return db_item;
  }
  /**
   *
   * Item query in database
   * @param {Pomodoro_query} query
   * @returns {*}
   * @example
   * returns null or the item
   *
   */
  query(query) {
    if (!this._connection.is_opened()) return;
    const dm = this._connection.statement_execute_select(query.statement, null)
    const iter = dm.create_iter()
    const item_list = []

    while (iter.move_next()) {
      const id = iter.get_value_for_field('id');
      const title = iter.get_value_for_field('title');
      const description = iter.get_value_for_field('description');
      const work_time = iter.get_value_for_field('work_time');
      const break_time = iter.get_value_for_field('break_time');
      const day = iter.get_value_for_field('day');
      const day_of_month = iter.get_value_for_field('day_of_month');
      const year = iter.get_value_for_field('year');
      const week = iter.get_value_for_field('week');
      const month = iter.get_value_for_field('month');
      const display_date = iter.get_value_for_field('display_date');
      const sessions = iter.get_value_for_field('sessions');

      item_list.push(new Db_item({
        id,
        title,
        description,
        work_time,
        break_time,
        day,
        day_of_month,
        year,
        week,
        month,
        display_date,
        sessions,
      }));
    }

    return item_list;
  }
}
