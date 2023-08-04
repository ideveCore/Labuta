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
import Gdk from 'gi://Gdk';
import GLib from 'gi://GLib';
import Template from './timer.blp' assert { type: 'uri' };

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
    this.current_break_time = this.break_time;
    this.is_break_timer = false;
    this.timer_state = null;
    this._timer_label.set_text(this._format_timer());
    this.application.settings.connect("changed::work-time", () => {
      if (this.application.timer_state === 'stopped') {
        this.work_time = this.application.settings.get_int('work-time');
        this.current_work_time = this.work_time;
        this._timer_label.set_text(this._format_timer());
      }
    });
    this.application.settings.connect("changed::break-time", () => {
      if (this.application.timer_state === 'stopped') {
        this.work_time = this.application.settings.get_int('break-time');
        this.current_break_time = this.break_time;
      }
    });
    this.application.settings.connect("changed::long-break", () => {
      if (this.application.timer_state === 'stopped') {
        this.long_break = this.application.settings.get_int('long-break');
      }
    });
    this.application.settings.connect("changed::sessions-long-break", () => {
      if (this.application.timer_state === 'stopped') {
        this.sessions_long_break = this.application.settings.get_int('sessions-long-break');
      }
    });
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
  _format_timer() {
    let hours = Math.floor(Math.abs(this.current_work_time < 0 ? this.current_work_time + this.current_break_time : this.current_work_time) / 60 / 60)
    let minutes = Math.floor(Math.abs(this.current_work_time < 0 ? this.current_work_time + this.current_break_time : this.current_work_time) / 60) % 60;
    let seconds = Math.abs(this.current_work_time < 0 ? this.current_work_time + this.current_break_time : this.current_work_time) % 60;

    if (hours.toString().split('').length < 2) {
      hours = `0${hours}`
    }
    if (minutes.toString().split('').length < 2) {
      minutes = `0${minutes}`
    }
    if (seconds.toString().split('').length < 2) {
      seconds = `0${seconds}`
    }
    return `${hours}:${minutes}:${seconds}`
  }
  _on_handler_timer() {
    const title = this._title_entry.get_text();
    const description = this._description_entry.get_text();

    this.application.timer_state === 'stopped' || this.application.timer_state === 'paused' ?
      this.application.timer_state = 'running' : this.application.timer_state = 'paused';
    this._title_entry.editable = false;
    this._description_entry.editable = false;
    if (this.application.timer_state === 'running') {
      if (!this.timer_running) {
        const current_date = GLib.DateTime.new_now_local()
        this.data = {
          title: title ? title : `${_('Started at')} ${this._get_schedule()}`,
          description,
          work_time: 0,
          break_time: 0,
          date: {
            day: current_date.get_day_of_year(),
            day_of_month: current_date.get_day_of_month(),
            year: current_date.get_year(),
            week: current_date.get_week_of_year(),
            month: current_date.get_month(),
            display_date: this._get_date(),
          },
          id: GLib.uuid_string_random(),
          counts: 0,
        }
        this.timer_running = true;
        GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
          if (this.application.timer_state === 'stopped') {
            if (!this.data)
              return
            const array = this.application.data;
            array.push(this.data);
            this.application.data = array;
            this.application._save_data();
            this.data = null;
            return GLib.SOURCE_REMOVE
          }
          if (this.application.timer_state === 'paused') {
            if (!this.application.active_window.visible)
              this.application._load_background_portal_status(`${_('Pomodoro paused')}`)
            return GLib.SOURCE_CONTINUE
          }


          if (this.current_work_time === this.work_time) {
            this._timer_label.get_style_context().remove_class('error');
            this.application._send_notification({ title: `${_("Pomodoro started")} - ${this.data.title}`, body: `${_("Description")}: ${this.data.description}\n${_("Created at")}: ${this.data.date.display_date}` })
          } else if (this.current_work_time === 0) {
            this._timer_label.get_style_context().add_class('error');
            this.application._send_notification({ title: `${_("Pomodoro break time")} - ${this.data.title}`, body: `${_("Description")}: ${this.data.description}\n${_("Created at")}: ${this.data.date.display_date}` })
            this.application._play_sound({ name: 'complete', cancellable: null })
          }


          if (this.current_work_time > 0) {
            this.data.work_time = this.data.work_time + 1
            if (!this.application.active_window.visible)
              this.application._load_background_portal_status(`${_('Work time')}: ${this._format_timer()}`)
          } else {
            this.data.break_time = this.data.break_time + 1
            if (!this.application.active_window.visible)
              this.application._load_background_portal_status(`${_('Break time')}: ${this._format_timer()}`)
          }

          this.current_work_time--

          this._timer_label.set_text(this._format_timer())

          if (this.current_work_time > (this.current_break_time * -1)) {
            return GLib.SOURCE_CONTINUE
          }

          this.application.timer_state = 'paused';
          this._stack_timer_controls.visible_child_name = 'paused_timer';
          this.current_work_time = this.work_time;
          this.data.counts = this.data.counts + 1;
          if (this.data.counts > 0) {
            this._tag_label.set_label(`<span weight="bold" size="9pt">${this.data.counts}</span>`);
            this._pomodoro_counts.set_visible(true);
          }
          if (this.data.counts === this.sessions_long_break) {
            this.current_break_time = this.long_break;
          }
          this.application._send_notification({ title: `${_("Pomodoro finished")} - ${this.data.title}`, body: `${_("Description")}: ${this.data.description}\n${_("Created at")}: ${this.data.date.display_date}` })
          this._timer_label.get_style_context().remove_class('error');
          this.application._play_sound({ name: 'alarm-clock-elapsed', cancellable: null })
          this._timer_label.set_text(this._format_timer());
          return GLib.SOURCE_CONTINUE
        })
      }
      this._stack_timer_controls.visible_child_name = 'running_timer';
    } else {
      this._stack_timer_controls.visible_child_name = 'paused_timer';
    }
  }
  _on_reset_timer() {
    this.work_time = this.application.settings.get_int('work-time');
    this.break_time = this.application.settings.get_int('break-time');
    this.long_break = this.application.settings.get_int('long-break');
    this.sessions_long_break = this.application.settings.get_int('sessions-long-break');
    this._pomodoro_counts.set_visible(false);
    this.timer_running = false;
    this.current_work_time = this.work_time;
    this.current_break_time = this.break_time;
    this._title_entry.editable = true;
    this._description_entry.editable = true;
    this._stack_timer_controls.visible_child_name = 'init_timer';
    this.data = null;
    this._timer_label.get_style_context().remove_class('error');
    this._timer_label.set_text(this._format_timer());
    this.application.timer_state = 'stopped'
  }
  _on_stop_timer() {
    this.work_time = this.application.settings.get_int('work-time');
    this.break_time = this.application.settings.get_int('break-time');
    this.long_break = this.application.settings.get_int('long-break');
    this.sessions_long_break = this.application.settings.get_int('sessions-long-break');
    this._pomodoro_counts.set_visible(false);
    this.timer_running = false;
    this._title_entry.set_text('');
    this._description_entry.set_text('');
    this.current_work_time = this.work_time;
    this.current_break_time = this.break_time;
    this._title_entry.editable = true;
    this._description_entry.editable = true;
    this._stack_timer_controls.visible_child_name = 'init_timer';
    this._timer_label.get_style_context().remove_class('error');
    this._timer_label.set_text(this._format_timer());
    if (this.data) {
      const array = this.application.data;
      array.push(this.data);
      this.application.data = array;
      this.application._save_data();
    }
    this.data = null;
    this.application.timer_state = 'stopped';
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

