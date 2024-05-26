/* timer-controls.js
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
import "./start_pause_button/main.js";
import Resource from './index.blp';

/**
 *
 * Create timer controls
 *
 * @param {Object} params
 * @param {Adw.Application} params.application
 *
 */
export const timer_controls = ({ application }) => {
  const builder = Gtk.Builder.new_from_resource(Resource);
  const timer = application.utils.timer;
  const pomodoro_item = application.utils.pomodoro_item;
  const component = builder.get_object("component");
  const skip_timer = builder.get_object("skip_timer");
  const reset_timer = builder.get_object("reset_timer");
  const stop_timer = builder.get_object("stop_timer");

  timer.connect('start', () => {
    component.visible_child_name = 'running_timer';
  });
  timer.connect('pause', () => {
    component.visible_child_name = 'paused_timer';
  });
  timer.connect('end', () => {
    component.visible_child_name = 'paused_timer';
  });
  timer.connect('stop', () => {
    component.visible_child_name = 'init_timer';
  });

  skip_timer.connect("clicked", () => timer.technique.skip());
  reset_timer.connect("clicked", () => timer.technique.reset());
  stop_timer.connect("clicked", () => timer.technique.stop());

  return component;
}
