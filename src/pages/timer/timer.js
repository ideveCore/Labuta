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
import { Db_item } from '../../db.js';
import { create_timestamp } from '../../utils.js';

/**
 *
 * Create timer page
 * @class
 *
 */
export default class Timer extends Adw.Bin {
  static {
    GObject.registerClass({
      Template,
      GTypeName: 'Timer',
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
    var size_group = new Gtk.SizeGroup(Gtk.SizeGroupMode.Horizontal);
    size_group.add_widget(this._tag_area);
    size_group.add_widget(this._tag_label);
    this._tag_area.set_draw_func(this._draw_tag);

    this.application = Gtk.Application.get_default();
    this.application.Timer.$start((timer) => {
      this._stack_timer_controls.visible_child_name = 'running_timer';
      this._title_entry.set_text(timer.data.title);
      this._description_entry.set_text(timer.data.description);
      this._title_entry.editable = false;
      this._description_entry.editable = false;
      this._load_time(timer);
    })
    this.application.Timer.$((timer) => {
      this._load_time(timer);
    });
    this.application.Timer.$pause((timer) => {
      this._stack_timer_controls.visible_child_name = 'paused_timer';
      this._load_time(timer);
    });
    this.application.Timer.$start((timer) => {
      this._stack_timer_controls.visible_child_name = 'running_timer';
      this._load_time(timer);
    });
    this.application.Timer.$stop((timer) => {
      this._stack_timer_controls.visible_child_name = 'init_timer';
      this._pomodoro_counts.set_visible(false);
      this._title_entry.editable = true;
      this._description_entry.editable = true;
      this._title_entry.set_text('');
      this._description_entry.set_text('');
      this._load_time(timer);
      this._pomodoro_counts.set_visible(false);
    });
    this.application.Timer.$end((timer) => {
      this._stack_timer_controls.visible_child_name = 'paused_timer';
      this._load_time(timer);
    });
    this.application.Timer.$settings((timer) => {
      this._load_time(timer);
    });
    this._load_time(this.application.Timer);
  }
  /**
   *
   * Load time method
   */
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

  /**
   *
   * Get current date formatted method
   *
   */
  _get_date() {
    const current_date = GLib.DateTime.new_now_local();
    const day_of_week = current_date.format('%A');
    const day_of_month = current_date.get_day_of_month();
    const month_of_year = current_date.format('%B');
    const year = current_date.get_year();
    return `${day_of_week}, ${day_of_month} ${_("of")} ${month_of_year} ${_("of")} ${year}`
  }

  /**
   *
   * Get current time method
   *
   */
  _get_time() {
    const hour = new GLib.DateTime().get_hour();
    const minute = new GLib.DateTime().get_minute();
    const second = new GLib.DateTime().get_second();
    return `${hour > 9 ? hour : '0' + hour}:${minute > 9 ? minute : '0' + minute}:${second > 9 ? second : '0' + second}`
  }

  /**
   *
   * Create pause or start timer method
   *
   */
  _on_start_pause_timer() {
    const title = this._title_entry.get_text();
    const description = this._description_entry.get_text();
    if (this.application.Timer.timer_state === 'stopped') {
      const current_date = GLib.DateTime.new_now_local()
      const db_item = new Db_item({
        id: null,
        title: title ? title : `${_('Started at')} ${this._get_time()}`,
        description,
        work_time: 0,
        break_time: 0,
        day: current_date.get_day_of_year(),
        day_of_month: current_date.get_day_of_month(),
        year: current_date.get_year(),
        week: current_date.get_week_of_year(),
        month: current_date.get_month(),
        display_date: this._get_date(),
        timestamp: Math.floor(create_timestamp(null, null, null) / 1000),
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

  /**
   *
   * Reset timer method
   */
  _on_reset_timer() {
    this.application.Timer.reset();
  }

  /**
   *
   * Stop timer method
   *
   */
  _on_stop_timer() {
    this.application.Timer.stop();
  }

  /**
   *
   * Draw pomodoro sessions element
   *
   */
  _draw_tag(area, cr, width, height) {
    const color = new Gdk.RGBA();
    color.parse('rgba(220 ,20 ,60 , 1)');
    Gdk.cairo_set_source_rgba(cr, color);
    cr.arc(height / 2, height / 2, height / 2, 0.5 * Math.PI, 1.5 * Math.PI);
    cr.arc(width - height / 2, height / 2, height / 2, -0.5 * Math.PI, 0.5 * Math.PI);
    cr.closePath();
    cr.fill();
  }
}

