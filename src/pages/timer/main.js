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
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Resource from './index.blp';
import { TimerControls } from '../../components/timer-controls/timer-controls.js';

/**
 *
 * Create timer page
 *
 * @param {Object} params
 * @param {Adw.Application} params.application
 * @param {Function} params.display_timer
 *
 */
export const timer = ({ application, display_timer }) => {
  const builder = Gtk.Builder.new_from_resource(Resource);
  const component_element = builder.get_object("component");
  const timer_container_element = builder.get_object("timer_container");

  timer_container_element.append(display_timer);
  timer_container_element.append(new TimerControls({ application }));

  return component_element;
}
