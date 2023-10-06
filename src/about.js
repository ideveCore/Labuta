/* about.js
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

import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import {
  getGIRepositoryVersion,
  getGjsVersion,
  getGLibVersion,
} from "../troll/src/util.js";

/**
 *
 * Create about params
 * @param {object} param
 * @param {Adw.Application} param.application
 *
 * @typeref {object} params
 * @property {Adw.ApplicationWindow} params.transient_for
 * @property {string} application_name
 * @property {string} application_icon
 * @property {string} developer_name
 * @property {string} version
 * @property {string} comments
 * @property {string} website
 * @property {string} issue_url
 * @property {string} support_url
 * @property {string[]} developers
 * @property {string} debug_info
 * @property {string} copyright
 * @property {string} license_type
 *
 */
export const create_about_params = ({ application  }) => {
  const flatpak_info = get_flatpak_info();
  const debug_info = `
${pkg.name} ${pkg.version}
${GLib.get_os_info("ID")} ${GLib.get_os_info("VERSION_ID")}
GJS ${getGjsVersion()}
Adw ${getGIRepositoryVersion(Adw)}
GTK ${getGIRepositoryVersion(Gtk)}
GLib ${getGLibVersion()}
Flatpak ${flatpak_info.get_string("Instance", "flatpak-version")}
Blueprint 0.10.0
    `.trim();
  return {
    transient_for: application.active_window,
    application_name: 'Pomodoro',
    application_icon: pkg.name,
    developer_name: 'Ideve Core',
    version: pkg.version,
    comments: _(
      "Pomodoro is a timer utility with rules, ideal for better productivity.",
    ),
    website: "https://gitlab.com/idevecore/pomodoro",
    support_url: "https://gitlab.com/idevecore/pomodoro",
    developers: [
      'Ideve Core'
    ],
    issue_url: 'https://gitlab.com/idevecore/pomodoro/-/issues',
    debug_info,
    copyright: '© 2023 Ideve Core',
    license_type: Gtk.License.GPL_3_0_ONLY,
  };
}

/**
 *
 * Get Flatpak info
 *
 */
const get_flatpak_info = () => {
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
