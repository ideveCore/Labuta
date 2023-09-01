/* timer.js
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
import Gio from 'gi://Gio';
import Gdk from 'gi://Gdk';
import GLib from 'gi://GLib';
import Template from './timer.blp' assert { type: 'uri' };
import { Db_item } from '../../db.js';
import { create_sort_date, format_time } from '../../utils.js';

export default class Timer extends Adw.Bin {
  static {
    GObject.registerClass({
      Template,
      InternalChildren: [
        "tag_label",
        "tag_area",
        "pomodoro_counts",
        'title_entry',
        'description_entry',
        'timer_label',
        'stack_timer_controls',
      ]
    }, this);
  }
  constructor() {
    super();
    var sizeGroup = new Gtk.SizeGroup(Gtk.SizeGroupMode.Horizontal);
    sizeGroup.add_widget(this._tag_area);
    sizeGroup.add_widget(this._tag_label);
    this._tag_area.set_draw_func(this._DrawTag);

    this.application = Gtk.Application.get_default();
    this.timer_running = false;
    this.work_time = this.application.settings.get_int('work-time');
    this.break_time = this.application.settings.get_int('break-time');
    this.long_break = this.application.settings.get_int('long-break');
    this.sessions_long_break = this.application.settings.get_int('sessions-long-break');
    this.current_work_time = this.work_time;
    this.current_break_time = this.work_time;
    this.is_break_timer = false;

    this.application.Timer.$start((timer) => {
      this._stack_timer_controls.visible_child_name = 'running_timer';
      this._title_entry.editable = false;
      this._description_entry.editable = false;
      this._load_time(timer);
    })
    this.application.Timer.$((timer) => {
      this._load_time(timer);
    });
    this.application.Timer.$pause((timer) => {
      this._stack_timer_controls.visible_child_name = 'paused_timer';
    });
    this.application.Timer.$start((timer) => {
      this._stack_timer_controls.visible_child_name = 'running_timer';
    });
    this.application.Timer.$stop((timer) => {
      this._stack_timer_controls.visible_child_name = 'init_timer';
      this._pomodoro_counts.set_visible(false);
      this._title_entry.editable = true;
      this._description_entry.editable = true;
      this._title_entry.set_text('');
      this._description_entry.set_text('');
      this._stack_timer_controls.visible_child_name = 'init_timer';
      this._timer_label.get_style_context().remove_class('error');
      this._timer_label.set_text(timer.format_time());
    });
    this.application.Timer.$end((timer) => {
      this._stack_timer_controls.visible_child_name = 'paused_timer';
      this._timer_label.get_style_context().remove_class('error');
      this._timer_label.set_text(timer.format_time());
    });
    this.application.Timer.$settings((timer) => {
      this._timer_label.set_text(timer.format_time());
    });
  }
  _load_time(timer) {
    if (timer.current_work_time === timer.work_time) {
      this._timer_label.get_style_context().remove_class('error');
    } else if (timer.current_work_time === 0) {
      this._timer_label.get_style_context().add_class('error');
    }

    this._timer_label.set_text(timer.format_time());

    if (timer.data.sessions > 0) {
      this._tag_label.set_label(`<span weight="bold" size="9pt">${timer.data.sessions}</span>`);
      this._pomodoro_counts.set_visible(true);
    }
  }
  _get_date() {
    const current_date = GLib.DateTime.new_now_local();
    const day_of_week = current_date.format('%A');
    const day_of_month = current_date.get_day_of_month();
    const month_of_year = current_date.format('%B');
    const year = current_date.get_year();
    return `${day_of_week}, ${day_of_month} ${_("of")} ${month_of_year} ${_("of")} ${year}`
  }
  _get_schedule() {
    const hour = new GLib.DateTime().get_hour();
    const minute = new GLib.DateTime().get_minute();
    const second = new GLib.DateTime().get_second();
    return `${hour > 9 ? hour : '0' + hour}:${minute > 9 ? minute : '0' + minute}:${second > 9 ? second : '0' + second}`
  }
  _on_start_pause_timer() {
    const title = this._title_entry.get_text();
    const description = this._description_entry.get_text();
    if (this.application.Timer.timer_state === 'stopped') {
      const current_date = GLib.DateTime.new_now_local()
      const db_item = new Db_item({
        id: null,
        title: title ? title : `${_('Started at')} ${this._get_schedule()}`,
        description,
        work_time: 0,
        break_time: 0,
        day: current_date.get_day_of_year(),
        day_of_month: current_date.get_day_of_month(),
        year: current_date.get_year(),
        week: current_date.get_week_of_year(),
        month: current_date.get_month(),
        display_date: this._get_date(),
        timestamp: Math.floor(create_sort_date(null, null, null) / 1000),
        sessions: 0,
      })
      this.data = this.application.data.save(db_item);
      this.timer_running = true;
      this.application.Timer.start(this.data);
    } else if (this.application.Timer.timer_state === 'running') {
      this.application.Timer.start(this.data);
      this._stack_timer_controls.visible_child_name = 'paused_timer';
    } else {
      this.application.Timer.start(this.data);
      this._stack_timer_controls.visible_child_name = 'running_timer';
    }
  }
  _on_reset_timer() {
    this.application.Timer.reset();
  }
  _on_stop_timer() {
    this.application.Timer.stop();
  }
  _DrawTag(area, cr, width, height) {
    const color = new Gdk.RGBA();
    color.parse('rgba(220 ,20 ,60 , 1)');
    Gdk.cairo_set_source_rgba(cr, color);
    cr.arc(height / 2, height / 2, height / 2, 0.5 * Math.PI, 1.5 * Math.PI);
    cr.arc(width - height / 2, height / 2, height / 2, -0.5 * Math.PI, 0.5 * Math.PI);
    cr.closePath();
    cr.fill();
  }
}

