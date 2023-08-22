/* main.js
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

import GLib from 'gi://GLib?version=2.0'
import Application from "./application.js";
import GSound from 'gi://GSound';
import { Db_item, Query_builder, Database } from './db.js';

const db = new Database()
db.setup()

const new_db_item = new Db_item({
  id: 6,
  title: 'ola1',
  description: 'ola des',
  work_time: 1500,
  break_time: 300,
  day: 260,
  day_of_month: 22,
  year: 2023,
  week: 4,
  month: 8,
  display_date: 'display date',
  sessions: 1
});

// db.save(new_db_item);
// db.delete(1);
// db.delete(2);
// db.delete(3);
// db.delete(4);
// db.delete(5);
// db.update(new_db_item);

const query = new Query_builder()
query.get_all()
const listitem = db.query(query.build())
console.log(listitem)
// // const query_builder = new Query_builder()

// console.log(db_item)

pkg.initGettext();
GLib.set_application_name('Pomodoro');

export const main = (argv) => {
  const application = new Application();
  const gsound = new GSound.Context();
  gsound.init(null);
  application.gsound = gsound;
  return application.runAsync(argv);
}

