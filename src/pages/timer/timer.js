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
import PomodoroItem from '../../pomodoro-item.js';
import { create_timestamp } from '../../utils.js';
import TimerControls from '../../components/timer-controls/timer-controls.js';
import GSettings from '../../gsettings.js';
import timer from '../../Timer.js';

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
        'timer_display',
        "tag_label",
        "tag_area",
        "pomodoro_counts",
        'title_entry',
        'description_entry',
        'timer_label',
      ]
    }, this);
  }
  constructor() {
    super();
    this._application = Gtk.Application.get_default();
    var size_group = new Gtk.SizeGroup(Gtk.SizeGroupMode.Horizontal);
    size_group.add_widget(this._tag_area);
    size_group.add_widget(this._tag_label);
    this._tag_area.set_draw_func(this._draw_tag);
    this._timer = new timer();
    this._pomodoro_item = new PomodoroItem();
    this._settings = new GSettings();

    this._timer.connect('start', (pomodoro_item) => {
      this._title_entry.set_text(pomodoro_item.title);
      this._description_entry.set_text(pomodoro_item.description);
      this._title_entry.editable = false;
      this._description_entry.editable = false;
      this._load_time(pomodoro_item);
    });
    this._timer.connect('run', (pomodoro_item) => {
      this._load_time(pomodoro_item);
    });
    this._timer.connect('pause', (pomodoro_item) => {
      this._load_time(pomodoro_item);
    });
    this._timer.connect('stop', (pomodoro_item) => {
      this._pomodoro_counts.set_visible(false);
      this._title_entry.editable = true;
      this._description_entry.editable = true;
      this._title_entry.set_text('');
      this._description_entry.set_text('');
      this._pomodoro_counts.set_visible(false);
      this._load_time(pomodoro_item);
    });
    this._timer.connect('end', (pomodoro_item) => {
      this._load_time(pomodoro_item);
    });
    this._settings.change('timer_customization', () => {
      if(this._timer.timer_state === 'stopped') {
        this._load_time(this._pomodoro_item.get)
      }
    })
    this._load_time(this._pomodoro_item.get);
    this._timer_display.append(new TimerControls());
  }

  /**
   *
   * Load time method
   * @param {Db_item} pomodoro_item
   *
   */
  _load_time(pomodoro_item) {
    if (this._timer.current_work_time === this._timer.work_time) {
      this._timer_label.get_style_context().remove_class('error');
    } else if (this._timer.current_work_time === 0) {
      this._timer_label.get_style_context().add_class('error');
    }

    this._timer_label.set_text(this._timer.format_time());

    if (pomodoro_item.sessions > 0) {
      this._tag_label.set_label(`<span weight="bold" size="9pt">${pomodoro_item.sessions}</span>`);
      this._pomodoro_counts.set_visible(true);
    }
  }

  /**
   *
   * Title changes listener
   * @param {Adw.EntryRow} target 
   *
   */
  _on_title_changed(target) {
    this._pomodoro_item.set = {title: target.get_text()};
  }

  /**
   *
   * Description changes listener
   * @param {Adw.EntryRow} target 
   *
   */
  _on_description_changed(target) {
    this._pomodoro_item.set = {description: target.get_text()};
  }

  /**
   *
   * Draw pomodoro sessions element
   * @param {Gtk.DrawingArea} area
   * @param {any} cr
   * @param {number} width
   * @param {number} height
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

