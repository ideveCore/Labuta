/* statistics.js
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
import GLib from 'gi://GLib';
import { data } from './stores.js';
import { format_timer } from './utils.js';

export const Statistics = GObject.registerClass({
  GTypeName: "Statistics",
  Template: 'resource:///io/gitlab/idevecore/Pomodoro/ui/statistics.ui',
  InternalChildren: [
    'work_timer_today',
    'work_timer_today_label',
    'work_timer_week',
    'work_timer_week_label',
    'work_timer_month',
    'work_timer_month_label',
    'break_timer_today_label',
    'break_timer_week_label',
    'break_timer_month_label'
  ],
}, class Statistics extends Adw.Bin {
  constructor() {
    super()
    this._current_date = GLib.DateTime.new_now_local();
    this.load_data()
  }
  load_data() {
    this.load_work_timer()
    this.load_break_timer()
  }
  get_day() {
    return this._current_date.get_day_of_year();
  }
  get_week() {
    return this._current_date.get_week_of_year();
  }
  get_month() {
    return this._current_date.get_month() + 1;
  }
  load_work_timer() {
    data.subscribe((value) => {
      const today = value.filter((item) => item.date.day === this.get_day())
      const yesterday = value.filter((item) => item.date.day === this.get_day() - 1);
      const week = value.filter((item) => item.date.week === this.get_week());
      const last_week = value.filter((item) => item.date.week === this.get_week() - 1);
      const month = value.filter((item) => item.date.month === this.get_month() - 1);
      const last_month = value.filter((item) => item.date.month === this.get_month() - 2);
      const work_timer_today = today.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
      const work_timer_yesterday = yesterday.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
      const work_timer_week = week.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
      const work_timer_last_week = last_week.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
      const work_timer_month = month.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
      const work_timer_last_month = last_month.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);

      const percentage_work_timer_today_yesterday = () => {
        let value = ((work_timer_today - work_timer_yesterday) / work_timer_yesterday) * 100;
        value = value ? value : 0
        value = value === Infinity ? 100 : value;
        let adjective = _('more');
        if (value < 0)
          adjective = _('less');
        return `${Math.abs(value).toFixed(0)}% ${adjective} ${_("than yesterday")}`
      }
      const percentage_work_timer_week_last_week = () => {
        let value = ((work_timer_week - work_timer_last_week) / work_timer_last_week) * 100;
        value = value ? value : 0
        value = value === Infinity ? 100 : value;

        let adjective = _('more');
        if (value < 0)
          adjective = _('less');
        return `${Math.abs(value).toFixed(0)}% ${adjective} ${_("than last week")}`
      }
      const percentage_work_timer_month_last_month = () => {
        let value = ((work_timer_month - work_timer_last_month) / work_timer_last_month) * 100;
        value = value ? value : 0
        value = value === Infinity ? 100 : value;
        let adjective = _('more');
        if (value < 0)
          adjective = _('less');
        return `${Math.abs(value).toFixed(0)}% ${adjective} ${_("than last month")}`
      }
      this._work_timer_today_label.set_text(format_timer(work_timer_today))
      this._work_timer_today.set_subtitle(percentage_work_timer_today_yesterday())
      this._work_timer_week_label.set_text(format_timer(work_timer_week))
      this._work_timer_week.set_subtitle(percentage_work_timer_week_last_week())
      this._work_timer_month_label.set_text(format_timer(work_timer_month))
      this._work_timer_month.set_subtitle(percentage_work_timer_month_last_month())
    })
  }
  load_break_timer() {
    data.subscribe((value) => {
      const today = value.filter((item) => item.date.day === this.get_day())
      const week = value.filter((item) => item.date.week === this.get_week());
      const month = value.filter((item) => item.date.month === this.get_month());

      const break_timer_today = today.reduce((accumulator, current_value) => accumulator + current_value.break_time, 0);
      const break_timer_week = week.reduce((accumulator, current_value) => accumulator + current_value.break_time, 0);
      const break_timer_month = month.reduce((accumulator, current_value) => accumulator + current_value.break_time, 0);

      this._break_timer_today_label.set_text(format_timer(break_timer_today))
      this._break_timer_week_label.set_text(format_timer(break_timer_week))
      this._break_timer_month_label.set_text(format_timer(break_timer_month))
    })
  }
})
