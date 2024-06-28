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
import GLib from 'gi://GLib';
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
  const nav_view = builder.get_object("nav_view");
  const sound_preferences_page = builder.get_object("sound_preferences_page");
  const navigate = (page) => (nav_view.push(page));

  const build_preferences_page = () => {
    const sound_preferences_group = new Gio.SimpleActionGroup();
    const select_sound_file = new Gio.SimpleAction({ name: 'select_sound_file', parameter_type: new GLib.Variant('s', '').get_type() });
    const timer_start_sound_wg = builder.get_object("timer_start_sound");
    const uri_timer_start_sound_wg = builder.get_object("uri_timer_start_sound");
    const repeat_timer_start_sound_wg = builder.get_object("repeat_timer_start_sound");
    const timer_break_sound_wg = builder.get_object("timer_break_sound");
    const uri_timer_break_sound_wg = builder.get_object("uri_timer_break_sound");
    const repeat_timer_break_sound_wg = builder.get_object("repeat_timer_break_sound");
    const timer_finish_sound_wg = builder.get_object("timer_finish_sound");
    const uri_timer_finish_sound_wg = builder.get_object("uri_timer_finish_sound");
    const repeat_timer_finish_sound_wg = builder.get_object("repeat_timer_finish_sound");

    const repeat_timer_start_sound_adj = builder.get_object("repeat_timer_start_sound_adj");
    const repeat_timer_break_sound_adj = builder.get_object("repeat_timer_break_sound_adj");
    const repeat_timer_finish_sound_adj = builder.get_object("repeat_timer_finish_sound_adj");

    const setup_timer_sounds = () => {
      const timer_start_sound = JSON.parse(application.utils.settings.get_string('timer-start-sound'));
      const timer_break_sound = JSON.parse(application.utils.settings.get_string('timer-break-sound'));
      const timer_finish_sound = JSON.parse(application.utils.settings.get_string('timer-finish-sound'));

      repeat_timer_start_sound_wg.set_value(timer_start_sound.repeat);
      timer_start_sound_wg.set_subtitle(timer_start_sound.type);
      uri_timer_start_sound_wg.set_title(timer_start_sound.uri);
      uri_timer_start_sound_wg.set_subtitle(timer_start_sound.type);
      repeat_timer_break_sound_wg.set_value(timer_break_sound.repeat);
      timer_break_sound_wg.set_subtitle(timer_break_sound.type);
      uri_timer_break_sound_wg.set_title(timer_break_sound.uri);
      uri_timer_break_sound_wg.set_subtitle(timer_break_sound.type);
      repeat_timer_finish_sound_wg.set_value(timer_finish_sound.repeat);
      timer_finish_sound_wg.set_subtitle(timer_finish_sound.type);
      uri_timer_finish_sound_wg.set_title(timer_finish_sound.uri);
      uri_timer_finish_sound_wg.set_subtitle(timer_finish_sound.type);
    }

    repeat_timer_start_sound_adj.connect("value-changed", (_target) => {
      const value = JSON.parse(application.utils.settings.get_string('timer-start-sound'));
      value.repeat = _target.get_value();
      application.utils.settings.set_string('timer-start-sound', JSON.stringify(value));
    });
    repeat_timer_break_sound_adj.connect("value-changed", (_target) => {
      const value = JSON.parse(application.utils.settings.get_string('timer-break-sound'));
      value.repeat = _target.get_value();
      application.utils.settings.set_string('timer-break-sound', JSON.stringify(value));
    });
    repeat_timer_finish_sound_adj.connect("value-changed", (_target) => {
      const value = JSON.parse(application.utils.settings.get_string('timer-finish-sound'));
      value.repeat = _target.get_value();
      application.utils.settings.set_string('timer-finish-sound', JSON.stringify(value));
    });

    application.utils.settings.connect("changed::timer-start-sound", setup_timer_sounds);
    application.utils.settings.connect("changed::timer-break-sound", setup_timer_sounds);
    application.utils.settings.connect("changed::timer-finish-sound", setup_timer_sounds);

    sound_preferences_group.add_action(select_sound_file);
    component.insert_action_group('sound_preferences', sound_preferences_group);

    select_sound_file.connect("activate", (simple_action, parameter) => {
      const sound_settings = parameter.get_string()[0];
      const dialog = Gtk.FileDialog.new();
      const sound_mimetypes = new Gtk.FileFilter({
        name: _('Sound files'),
        mime_types: [
          'audio/aac',
          'audio/x-wav',
          'audio/mpeg',
        ],
      });
      dialog.filters = new Gio.ListStore();
      dialog.filters.append(new Gtk.FileFilter({
        name: _('All files'),
        patterns: ['*'],
      }));
      dialog.filters.append(sound_mimetypes);
      dialog.default_filter = sound_mimetypes;
      dialog.open(application.get_active_window(), null, (_dialog, _task) => {
        try {
          const settings = JSON.parse(application.utils.settings.get_string(sound_settings));
          settings.uri = _dialog.open_finish(_task).get_uri();
          settings.type = 'file';
          application.utils.settings.set_string(sound_settings, JSON.stringify(settings));
          setup_timer_sounds();
        } catch (error) {
          console.log(error);
        }
      });
    });

    setup_timer_sounds();
  }

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

  build_preferences_page();
  sound_preferences_wk.connect("clicked", () => navigate(sound_preferences_page));

  return component;
}
