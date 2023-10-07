/* display-timer.js
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
import GLib from 'gi://GLib';
import Gdk from 'gi://Gdk';
import Template from './display-timer.blp' assert { type: 'uri' };

/**
 * Display Timer component
 *
 * @class
 * @extends {Gtk.Box}
 *
 */
export class DisplayTimer extends Gtk.Box {
  static {
    GObject.registerClass({
      GTypeName: 'DisplayTimer',
      Template,
      InternalChildren: [
        "tag_label",
        "tag_area",
        "pomodoro_counts",
        'timer_label',
      ],
    }, this)
  }
  /**
   *
   * Create a instance of Display Timer
   * @param {object} params
   * @param {Adw.Application} params.application
   *
   */
  constructor({ application }) {
    super();
    this._timer = application.utils.timer;
    this._pomodoro_item = application.utils.pomodoro_item;
    this._settings = application.utils.settings;
    const size_group = new Gtk.SizeGroup(Gtk.SizeGroupMode.Horizontal);
    size_group.add_widget(this._tag_area);
    size_group.add_widget(this._tag_label);
    this._tag_area.set_draw_func(this._draw_tag);

    this._timer.connect('start', ({ data, pomodoro_item }) => {
      this._load_time({ data, pomodoro_item });
      this._timer_label.get_style_context().remove_class('animation-pause');
    });
    this._timer.connect('run', ({ data, pomodoro_item }) => {
      this._load_time({ data, pomodoro_item });
      this._timer_label.get_style_context().remove_class('animation-pause');
    });
    this._timer.connect('pause', ({ data, pomodoro_item }) => {
      this._load_time({ data, pomodoro_item });
      this._timer_label.get_style_context().add_class('animation-pause');
    });
    this._timer.connect('stop', ({ data, pomodoro_item }) => {
      this._pomodoro_counts.set_visible(false);
      this._pomodoro_counts.set_visible(false);
      this._timer_label.get_style_context().remove_class('animation-pause');
      this._load_time({ data, pomodoro_item });
    });
    this._timer.connect('end', ({ data, pomodoro_item }) => {
      this._timer_label.get_style_context().remove_class('animation-pause');
      this._load_time({ data, pomodoro_item });
    });
    this._settings.change('timer_customization', () => {
      if(this._timer.get_data().timer_state === 'stopped') {
        this._load_time({ data: this._timer.get_data(), pomodoro_item: this._pomodoro_item })
      }
    })
    this._load_time({ data: this._timer.get_data(), pomodoro_item: this._pomodoro_item });
  }

  /**
   *
   * Load time method
   * @param {object} params
   * @param {this._timer.get()} params.data
   * @param {Db_item} params.pomodoro_item
   *
   */
  _load_time({ data, pomodoro_item }) {
    if (data.current_time === data.work_time) {
      this._timer_label.get_style_context().remove_class('error');
    } else if (data.current_time <= 0) {
      this._timer_label.get_style_context().add_class('error');
    }

    this._timer_label.set_text(data.formatted_time);

    if (pomodoro_item.sessions > 0) {
      this._tag_label.set_label(`<span weight="bold" size="9pt">${pomodoro_item.sessions}</span>`);
      this._pomodoro_counts.set_visible(true);
    }
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
