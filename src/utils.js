/* utils.js
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

import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk';
import GObject from 'gi://GObject';

/**
 *
 * Create timestap for pomodoro
 * @param {null|number} item_day
 * @param {null|number} item_year
 * @returns {number} return sum of current date hour, minutes, microseconds, year and day.
 *
 */
export const create_timestamp = (item_year, item_month, item_day) => {
  let time = new Date();
  const current_time = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
  if (item_year && item_month && item_day) {
    time = new Date(`${item_year < 10 ? '0' + item_year : item_year}-${item_month < 10 ? '0' + item_month : item_month}-${item_day < 10 ? '0' + item_day : item_day}T${current_time}`);
  }
  return time.getTime();
};

export const format_time = (timer) => {
  let hours = Math.floor(timer / 60 / 60)
  let minutes = Math.floor(timer / 60) % 60;
  let seconds = timer % 60;
  if (hours.toString().split('').length < 2) {
    hours = `0${hours}`
  }
  if (minutes.toString().split('').length < 2) {
    minutes = `0${minutes}`
  }
  if (seconds.toString().split('').length < 2) {
    seconds = `0${seconds}`
  }
  return `${hours}:${minutes}:${seconds}`
}

/**
 *
 * Get Flatpak info
 *
 */
export function get_flatpak_info() {
  const keyFile = new GLib.KeyFile();
  try {
    keyFile.load_from_file("/.flatpak-info", GLib.KeyFileFlags.NONE);
  } catch (err) {
    if (err.code !== GLib.FileError.NOENT) {
      logError(err);
    }
    return null;
  }
  return keyFile;
}
