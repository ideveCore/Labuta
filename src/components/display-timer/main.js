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
import Resource from './index.blp';

/**
 *
 * Create timer page
 *
 * @param {Object} params
 * @param {Adw.Application} params.application
 *
 */
export const display_timer = ({ application }) => {
  const builder = Gtk.Builder.new_from_resource(Resource);
  const timer = application.utils.timer;
  const component = builder.get_object("component");
  const timer_label = builder.get_object("timer_label");
  const pomodoro_counts = builder.get_object("pomodoro_counts");
  const tag_area = builder.get_object("tag_area");
  const tag_label = builder.get_object("tag_label");
  const pomodoro_item = application.utils.pomodoro_item;
  const settings = application.utils.settings;
  const size_group = new Gtk.SizeGroup(Gtk.SizeGroupMode.Horizontal);

  /**
   *
   * Load time method
   * @param {object} params
   * @param {timer.get()} params.data
   * @param {Db_item} params.pomodoro_item
   *
   */
  const load_time = ({ data, pomodoro_item }) => {
    if (data.current_time > 0) {
      timer_label.get_style_context().remove_class('error');
    } else {
      timer_label.get_style_context().add_class('error');
    }

    timer_label.set_text(data.formatted_time);

    if (pomodoro_item.sessions > 0) {
      tag_label.set_label(`<span weight="bold" size="9pt">${pomodoro_item.sessions}</span>`);
      pomodoro_counts.set_visible(true);
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
  const draw_tag = (area, cr, width, height) => {
    const color = new Gdk.RGBA();
    color.parse('rgba(220 ,20 ,60 , 1)');
    Gdk.cairo_set_source_rgba(cr, color);
    cr.arc(height / 2, height / 2, height / 2, 0.5 * Math.PI, 1.5 * Math.PI);
    cr.arc(width - height / 2, height / 2, height / 2, -0.5 * Math.PI, 0.5 * Math.PI);
    cr.closePath();
    cr.fill();
  }

  size_group.add_widget(tag_area);
  size_group.add_widget(tag_label);
  tag_area.set_draw_func(draw_tag);

  timer.connect('start', ({ data, pomodoro_item }) => {
    load_time({ data, pomodoro_item });
    timer_label.get_style_context().remove_class('animation-pause');
  });
  application.utils.timer.connect('run', ({ data, pomodoro_item }) => {
    load_time({ data, pomodoro_item });
  });
  timer_label.get_style_context().remove_class('animation-pause');
  timer.connect('pause', ({ data, pomodoro_item }) => {
    load_time({ data, pomodoro_item });
    timer_label.get_style_context().add_class('animation-pause');
  });
  timer.connect('stop', ({ data, pomodoro_item }) => {
    pomodoro_counts.set_visible(false);
    pomodoro_counts.set_visible(false);
    timer_label.get_style_context().remove_class('animation-pause');
    load_time({ data, pomodoro_item });
  });
  timer.connect('end', ({ data, pomodoro_item }) => {
    timer_label.get_style_context().remove_class('animation-pause');
    load_time({ data, pomodoro_item });
  });
  settings.change('timer_customization', () => {
    if (timer.get_data().timer_state === 'stopped') {
      load_time({ data: timer.get_data(), pomodoro_item: pomodoro_item })
    }
  })
  load_time({ data: timer.technique.get_data(), pomodoro_item: pomodoro_item });

  return component;
}
