/* main.js
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
import Resource from './index.blp';

/**
 *
 * Creates and returns a shortcuts window.
 *
 * @param {GObject.Application} application The application object.
 * @returns {Gtk.Widget} The timer controls component.
 *
 */
export const shortcuts = ({ application }) => {
  const builder = new Gtk.Builder();

  builder.add_from_resource(Resource);

  const component = builder.get_object("component");

  component.set_transient_for(application.get_active_window());
  return component;
}
