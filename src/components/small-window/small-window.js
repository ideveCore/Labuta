/* small-window.js
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
import { format_time } from '../../utils.js';
import { Db_item } from '../../db.js';
import PomodoroItem from '../../pomodoro-item.js';
import TimerControls from '../timer-controls/timer-controls.js';
import Timer from '../../Timer.js';
import Template from './small-window.blp' assert { type: 'uri' };

/**
 * 
 * Create HistoryRow element
 * @class
 *
 */
export class SmallWindow extends Adw.Window {
  static {
    GObject.registerClass({
      Template,
      GTypeName: 'SmallWindow',
      InternalChildren: [
        'overlay',
        'header_bar',
        'timer_controls',
        'timer_controls_box',
        'timer_label',
        'tag_label',
        'tag_area',
        'pomodoro_counts',
      ],
    }, this);
  }
  /**
   *
   * Create SmallWindow element
   *
   */
  constructor() {
    super();
    this._application = Gtk.Application.get_default();
    this._timer = new Timer();
    this._pomodoro_item = new PomodoroItem();
    const size_group = new Gtk.SizeGroup(Gtk.SizeGroupMode.Horizontal);
    size_group.add_widget(this._tag_area);
    size_group.add_widget(this._tag_label);
    this._tag_area.set_draw_func(this._draw_tag);
    this._timer_controls.append(new TimerControls());

    this._timer.connect('stop', () => {
      this._pomodoro_counts.set_visible(false);
      this._timer_label.get_style_context().remove_class('error');
      this._timer_label.set_text(this._timer.format_time());
      this._application.get_active_window().present();
      this.hide();
    });
    this._timer.connect('end', (pomodoro_item) => {
      this._load_timer(pomodoro_item);
    });
    this._timer.connect('run', (pomodoro_item) => {
      this._load_timer(pomodoro_item);
    });
    this._setup_event_controller();
    this._load_timer(this._pomodoro_item.get);
  }
  /**
   *
   * Load timer data
   * @param {Db_item} pomodoro_item
   *
   */
  _load_timer(pomodoro_item) {
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
   * Setup event controles (Mouse enter|leave)...
   *
   */
  _setup_event_controller() {
    const controller = new Gtk.EventControllerMotion();
    controller.connect("enter", () => {
      // this._header_bar.set_opacity(1);
      // this._timer_controls.set_opacity(1);
      this._timer_controls_box.set_opacity(1);
    })
    controller.connect("leave", () => {
      // this._header_bar.set_opacity(0);
      // this._timer_controls.set_opacity(0);
      this._timer_controls_box.set_opacity(0);
    })
    this._overlay.add_controller(controller)
  }
  _on_start_pause_timer() {
    this._application.Timer.start();
  }
  _on_reset_timer() {
    this._application.Timer.reset();
  }
  _on_stop_timer() {
    this._application.Timer.stop();
  }

  /**
   *
   * Create and add styles in Pomodoro session element
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
