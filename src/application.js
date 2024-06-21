/* application.js
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
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import { gettext as _ } from 'gettext';
import Style from './assets/style.css';
import { window } from './window.js';
import { small_window } from './components/small-window/main.js';
import { display_timer } from './components/display-timer/main.js';
import { timer_controls } from './components/timer-controls/main.js';
import { application_actions } from './actions.js';
import { utils } from './utils.js';

let provider;

export const application = new Adw.Application({
  application_id: pkg.name,
  flags: Gio.ApplicationFlags.DEFAULT_FLAGS,
  resource_base_path: '/io/gitlab/idevecore/Planytimer',
});

/**
 *
 * Application utils
 * @type {utils}
 *
 */
application.utils = utils({ application });
application.quit_request = () => {
  const run_in_background = application.utils.settings.get_boolean('run-in-background');
  if (!run_in_background) {
    application.utils.quit_request_dialog.open();
    return;
  }
  if (application.utils.timer.technique.get_data().timer_state === 'stopped') {
    application.quit();
    return;
  }
  application.active_window.hide();
  if (application.active_window) return;
}

/**
 *
 * Create main window
 * @param {Adw.Application} application
 *
 */
application.create_main_window = function () {
  const { active_window } = this;
  window({ application: this }).present();
  if (active_window) {
    active_window.destroy();
  }
}

/**
 *
 * Create small window
 * @param {Adw.Application} application
 *
 */
application.create_small_window = function() {
  const { active_window } = this;
  small_window({ application: this }).present();
  if(active_window) {
    active_window.destroy();
  }
}

/**
 *
 * Is called up when the application is started.
 *
 */
application.connect("activate", (user_data) => {
  user_data.global_components = {
    display_timer: display_timer({ application: user_data }),
    timer_controls: timer_controls({ application: user_data }),
  };

  user_data.create_main_window();
  user_data.utils.sound_player.setup_actions();

  // Load styles in app
  if (!provider) {
    provider = new Gtk.CssProvider();
    provider.load_from_resource(Style);
    Gtk.StyleContext.add_provider_for_display(
      Gdk.Display.get_default(),
      provider,
      Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION,
    );
  }
});

// Setup application actions
application_actions({ application });
