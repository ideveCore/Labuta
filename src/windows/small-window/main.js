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
import Resource from './index.blp';

/**
 *
 * Creates and returns a timer controls component.
 *
 * @param {GObject.Application} application The application object.
 * @returns {Gtk.Widget} The timer controls component.
 *
 */
export const small_window = ({ application }) => {
  const builder = new Gtk.Builder();
  const controller = new Gtk.EventControllerMotion();

  builder.add_from_resource(Resource);

  const component = builder.get_object("component");
  const overlay_controls = builder.get_object("overlay_controls");
  const overlay = builder.get_object("overlay");

  application.global_components.display_timer.unparent();
  application.global_components.timer_controls.unparent();
  builder.get_object("display_timer_container").append(application.global_components.display_timer);
  builder.get_object("timer_controls_container").append(application.global_components.timer_controls);

  controller.connect("enter", () => overlay_controls.set_opacity(1));
  controller.connect("leave", () => overlay_controls.set_opacity(0));

  application.utils.timer.connect('stop', () => {
    application.get_active_window().present();
    component.hide();
  });

  overlay.add_controller(controller);
  component.set_application(application);
  component.connect('close-request', () => {
    application.quit_request();
    return true;
  });
  return component;
}
