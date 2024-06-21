/* preferences.js
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
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import { sound_preferences } from '../sound-preferences/main.js';
import Resource from './index.blp';

/**
 *
 * Creates and returns a preferences component.
 *
 * @param {GObject.Application} application The application object.
 * @returns {Gtk.Widget} The preferences component.
 *
 */
export const preferences = ({ application }) => {
  const builder = new Gtk.Builder();

  builder.add_from_resource(Resource);

  const component = builder.get_object("component");
  const switch_play_sounds = builder.get_object("switch_play_sounds");
  const switch_autostart = builder.get_object("switch_autostart");
  const set_history_duration = builder.get_object("set_history_duration");
  const sound_preferences_wk = builder.get_object("sound_preferences");

  application.utils.settings.bind(
    "play-sounds",
    switch_play_sounds,
    "active",
    Gio.SettingsBindFlags.DEFAULT,
  );
  application.utils.settings.bind(
    "autostart",
    switch_autostart,
    "active",
    Gio.SettingsBindFlags.DEFAULT,
  );
  application.utils.settings.bind(
    "history-duration",
    set_history_duration,
    "value",
    Gio.SettingsBindFlags.DEFAULT,
  );

  sound_preferences_wk.connect("clicked", () => {
    sound_preferences({ application }).present(component);
  });

  return component;
}
