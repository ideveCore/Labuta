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
import Resource from './index.blp';

/**
 *
 * Create history details history_info_wg
 *
 * @param {Object} params
 * @param {Adw.Application} params.application
 * @param {number} params.id
 * @param {string} params.title
 * @param {Gtk.Widget} params.parent
 * @param {number} params.sessions
 * @param {string} params.subtitle
 * @param {number} params.work_time
 * @param {number} params.break_time
 * @param {string} params.description
 *
 */
export const history_details  = (
  {
    application,
    id,
    title,
    parent,
    sessions,
    subtitle,
    work_time,
    break_time,
    description
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

  history_info_wg.set_title(title);
  history_info_wg.set_description(description || _('No description'));
  date_wg.set_text(subtitle);
  work_time_wg.set_text(application.utils.format_time(work_time).toString());
  break_time_wg.set_text(application.utils.format_time(break_time).toString());
  sessions_wg.set_text(sessions.toString());

  continue_timer_wg.connect("clicked", () => {
    const timer_state = application.utils.timer.technique.get_data().timer_state;
    if (timer_state !== 'running' && timer_state !== 'paused') {
      application.utils.pomodoro_item.set = { title, description }
      application.utils.timer.start();
      parent.close();
    } else {
      component_wg.add_toast(new Adw.Toast({
        title: _("Timer already in progress"),
      }));
    }
  });

  return component_wg;
}
