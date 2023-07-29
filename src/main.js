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

import GLib from 'gi://GLib?version=2.0'
import Application from "./application.js";
import GSound from 'gi://GSound';

pkg.initGettext();
GLib.set_application_name('Pomodoro');

export const main = (argv) => {
  const application = new Application();
  const gsound = new GSound.Context();
  gsound.init(null);
  application.gsound = gsound;
  return application.runAsync(argv);
}

