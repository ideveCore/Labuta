/*
 * main.js
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
import Gio from 'gi://Gio';
import { start_timer } from '../start-timer/main.js';
import Resource from './index.blp';

/**
 *
 * Create history details history_info_wg
 *
 * @param {Object} params
 * @param {Adw.Application} params.application
 * @param {Object} params.timer_item
 * @param {Gtk.Widget} params.parent
 *
 */
export const history_details  = (
  {
    application,
    timer_item,
    parent,
  }) => {
  const builder = new Gtk.Builder();
  builder.add_from_resource(Resource);

  const component_wg = builder.get_object("component");
  const history_info_wg = builder.get_object("history_info");
  const work_time_wg = builder.get_object("work_time");
  const break_time_wg = builder.get_object("break_time");
  const sessions_wg = builder.get_object("sessions");
  const date_wg = builder.get_object("date");
  const continue_timer_wg = builder.get_object("continue_timer");
  const edit_timer_wg = builder.get_object("edit_timer");

  history_info_wg.set_title(timer_item.title);
  history_info_wg.set_description(timer_item.description || _('No description'));
  date_wg.set_text(timer_item.display_date);
  work_time_wg.set_text(application.utils.format_time(timer_item.work_time).toString());
  break_time_wg.set_text(application.utils.format_time(timer_item.break_time).toString());
  sessions_wg.set_text(timer_item.sessions.toString());

  continue_timer_wg.connect("clicked", () => {
    const timer_state = application.utils.timer.technique.get_data().timer_state;
    if (timer_state !== 'running' || timer_state !== 'paused') {
      start_timer({
        application: application,
        timer_item,
        edit: false,
      }).present(application.get_active_window());
      parent.close();
    } else {
      component_wg.add_toast(new Adw.Toast({
        title: _("Timer already in progress"),
      }));
    }
  });
  edit_timer_wg.connect("clicked", () => {
    start_timer({
      application: application,
      timer_item,
      edit: true,
    }).present(application.get_active_window());
    parent.close();
  });

  return component_wg;
}
