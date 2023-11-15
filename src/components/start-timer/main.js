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
 */


import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw?version=1';
import Resource from './index.blp';

/**
 *
 * Create a start technique component
 * @param {object} params
 * @param {Adw.Application} params.application
 *
 * @returns {Gtk.Widget}
 *
 */
export const start_timer = ({ application }) => {
  const builder = Gtk.Builder.new_from_resource(Resource);
  const component = builder.get_object('component');
  const switch_techniques = builder.get_object('technique');
  const techniques_wd = builder.get_object('techniques');
  const title_timer = builder.get_object('title_timer');
  const description_timer = builder.get_object('description_timer');
  const start_timer_button = builder.get_object('start_timer_button');
  const techniques = {
    pomodoro: pomodoro({ application }),
    flowtime: flow_time({ application }),
  }
  let current_technique = techniques.pomodoro;

  component.set_transient_for(application.get_active_window());
  techniques_wd.set_child(current_technique.component);

  switch_techniques.connect('notify::selected', (selected_widget) => {
    current_technique = techniques[selected_widget.get_selected_item().get_string().toLowerCase().replace(/ /gi, '')];
    techniques_wd.set_child(current_technique.component);
  })

  start_timer_button.connect('clicked', () => {
    application.utils.timer.technique = application.utils.timer.flow_time({ break_time_percentage: 15 });
    application.utils.timer.technique.start();
    component.close();
  })

  return component
}

/**
 *
 * Create a pomodoro template
 * @param {object} params
 * @param {Adw.Application} params.application
 *
 * @returns {Gtk.Widget}
 *
 */
const pomodoro = ({ application }) => {
  const builder = Gtk.Builder.new_from_resource(Resource);
  const container = builder.get_object('pomodoro');
  return {
    component: container,
    technique: application.utils.timer.pomodoro,
  }
}

/**
 *
 * Create a Flow time template
 * @param {object} params
 * @param {Adw.Application} params.application
 *
 * @returns {Gtk.Widget}
 *
 */
const flow_time = ({ application }) => {
  const builder = Gtk.Builder.new_from_resource(Resource);
  const container = builder.get_object('flowtime');
  return {
    component: container,
    technique: application.utils.timer.flow_time,
  }
}
