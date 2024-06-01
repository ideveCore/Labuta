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
 *
 */

import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import GLib from 'gi://GLib';
import Resource from './index.blp';

/**
 *
 * Creates and returns a statistics page.
 *
 * @param {GObject.Application} application The application object.
 * @returns {Gtk.Widget} The statistics page.
 *
 */
export const statistics = ({ application }) => {
  const builder = new Gtk.Builder();
  const data = application.utils.application_db_manager;
  const current_date = GLib.DateTime.new_now_local();
  const format_time = application.utils.format_time;

  builder.add_from_resource(Resource);

  const component = builder.get_object("component");
  const work_time_today_subtitle = builder.get_object("work_time_today");
  const work_time_today_label = builder.get_object("work_time_today_label");
  const work_time_week_subtitle = builder.get_object("work_time_week");
  const work_time_week_label = builder.get_object("work_time_week_label");
  const work_time_month_subtitle = builder.get_object("work_time_month");
  const work_time_month_label = builder.get_object("work_time_month_label");
  const break_time_today_label = builder.get_object("break_time_today_label");
  const break_time_week_label = builder.get_object("break_time_week_label");
  const break_time_month_label = builder.get_object("break_time_month_label");

  const get_day = () => current_date.get_day_of_year();
  const get_week = () => current_date.get_week_of_year();
  const get_month = () => current_date.get_month();
  const load_statistic_data = () => {
    const today = data.get().filter((item) => item.day === get_day())
    const yesterday = data.get().filter((item) => item.day === get_day() - 1);
    const week = data.get().filter((item) => item.week === get_week());
    const last_week = data.get().filter((item) => item.week === get_week() - 1);
    const month = data.get().filter((item) => item.month === get_month());
    const last_month = data.get().filter((item) => item.month === get_month() - 1);
    const work_time_today = today.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
    const work_timer_yesterday = yesterday.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
    const work_time_week = week.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
    const work_timer_last_week = last_week.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
    const work_time_month = month.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
    const work_timer_last_month = last_month.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
    const break_time_today = today.reduce((accumulator, current_value) => accumulator + current_value.break_time, 0);
    const break_time_week = week.reduce((accumulator, current_value) => accumulator + current_value.break_time, 0);
    const break_time_month = month.reduce((accumulator, current_value) => accumulator + current_value.break_time, 0);

    const percentage_work_time_today_yesterday = () => {
      let value = ((work_time_today - work_timer_yesterday) / work_timer_yesterday) * 100;
      value = value ? value : 0
      value = value === Infinity ? 100 : value;
      let adjective = _('more');
      if (value < 0)
        adjective = _('less');
      return `${Math.abs(value).toFixed(0)}% ${adjective} ${_("than yesterday")}`
    }
    const percentage_work_time_week_last_week = () => {
      let value = ((work_time_week - work_timer_last_week) / work_timer_last_week) * 100;
      value = value ? value : 0
      value = value === Infinity ? 100 : value;

      let adjective = _('more');
      if (value < 0)
        adjective = _('less');
      return `${Math.abs(value).toFixed(0)}% ${adjective} ${_("than last week")}`
    }
    const percentage_work_time_month_last_month = () => {
      let value = ((work_time_month - work_timer_last_month) / work_timer_last_month) * 100;
      value = value ? value : 0
      value = value === Infinity ? 100 : value;
      let adjective = _('more');
      if (value < 0)
        adjective = _('less');
      return `${Math.abs(value).toFixed(0)}% ${adjective} ${_("than last month")}`
    }

    work_time_today_label.set_text(format_time(work_time_today));
    work_time_today_subtitle.set_subtitle(percentage_work_time_today_yesterday());
    work_time_week_label.set_text(format_time(work_time_week));
    work_time_week_subtitle.set_subtitle(percentage_work_time_week_last_week());
    work_time_month_label.set_text(format_time(work_time_month));
    work_time_month_subtitle.set_subtitle(percentage_work_time_month_last_month());
    break_time_today_label.set_text(format_time(break_time_today));
    break_time_week_label.set_text(format_time(break_time_week));
    break_time_month_label.set_text(format_time(break_time_month));
  }

  application.utils.timer.connect('stop', () => {
    load_statistic_data();
  });

  load_statistic_data();
  return component;
}
