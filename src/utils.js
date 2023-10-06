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
import Adw from 'gi://Adw';
import GSound from 'gi://GSound';
import Gst from 'gi://Gst';
import Xdp from 'gi://Xdp';
import XdpGtk4 from 'gi://XdpGtk4';
import Settings from './settings.js';
import { ApplicationDbManager } from './application-db-manager.js';
import { PomodoroItem } from './pomodoro-item.js';
import { timer } from './timer.js';
import { gettext as _ } from 'gettext';

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


/**
 *
 *
 * Return time formatted
 * @param {number} time
 * @returns {string}
 *
 */
const format_time = (time) => {
  let hours = Math.floor(time / 60 / 60)
  let minutes = Math.floor(time / 60) % 60;
  let seconds = time % 60;
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
 * Sound Player
 * @param {object} params
 * @param {Adw.Applicatin} params.application
 * @param {Settings} params.settings
 *
 */

const sound_player = ({ application, settings }) => {
  const gsound = new GSound.Context();
  gsound.init(null);
  Gst.init(null);


  /**
   *
   * Play sound using libgsound
   *
   * @param {object} params
   * @param {string} params.uri - name of sound
   * @param {number} params.repeat - counts for repeat sound
   *
   */
  const gsound_player = ({ uri, repeat }) => {
    new Promise((resolve, reject) => {
      gsound.play_full(
        { 'event.id': uri },
        null,
        (source, res) => {
          try {
            resolve(source.play_full_finish(res));
          } catch (e) {
            reject(e);
          }
        }
      );
    }).then((res) => {
      if (repeat > 1) {
        gsound_player({uri, repeat: --repeat})
      }
    }).catch((error) => {
      console.log(error)
    })
  }

  /**
   * Play sound using libgst
   *
   * @param {object} params
   * @param {string} params.uri - uri for sound file
   * @param {number} params.repeat - counts for repeat sound
   *
   */
  const gst_player = ({ uri, repeat }) => {
    const playbin = Gst.ElementFactory.make('playbin', 'playbin');
    playbin.set_property('volume', 1);
    playbin.set_property('mute', false);
    playbin.set_state(Gst.State.READY);
    playbin.set_property('uri', uri);
    const bus = playbin.get_bus()
    bus.add_signal_watch()
    bus.connect('message::error', (error, message) => {
      log('Bus error:', message.parse_error())
    })
    bus.connect('message::eos', () => {
      playbin.set_state(Gst.State.READY)
      if (repeat > 1) {
        gst_player({uri, repeat: --repeat});
      }
    })
    playbin.set_state(Gst.State.PLAYING)
  }

  /**
   *
   * Play the sound
   * @param {object} params
   * @param {string} params.sound_settings
   *
   */
  const play = ({ sound_settings  }) => {
    const sound_data = JSON.parse(settings.get_string(sound_settings));

    if (settings.get_boolean('play-sounds')) {
      const player_params = {
        uri: sound_data.uri,
        repeat: sound_data.repeat,
      };
      if (sound_data.type === 'freedesktop') {
        gsound_player(player_params);
      } else {
        gst_player(player_params);
      }
    }
  }

  return {
    play,
  }
}

/**
 *
 * Get current date formatted
 * @returns {string}
 *
 */
export const get_date = () => {
  const current_date = GLib.DateTime.new_now_local();
  const day_of_week = current_date.format('%A');
  const day_of_month = current_date.get_day_of_month();
  const month_of_year = current_date.format('%B');
  const year = current_date.get_year();
  return `${day_of_week}, ${day_of_month} ${_("of")} ${month_of_year} ${_("of")} ${year}`
}

/**
 *
 * Get pomodoro time utils
 *
 * @typedef {Object} time_utils
 * @property {string} time - current time
 * @property {number} day - current day
 * @property {number} day_of_month - current day of month
 * @property {number} year - current year
 * @property {number} week - current week
 * @property {number} month - current month
 * @property {string} display_date - display date
 * @property {number} timestamp - current timestamp
 *
 */
export const pomodoro_time_utils = () => {
  const current_date = GLib.DateTime.new_now_local();

  const hour = new GLib.DateTime().get_hour();
  const minute = new GLib.DateTime().get_minute();
  const second = new GLib.DateTime().get_second();
  const time = `${hour > 9 ? hour : '0' + hour}:${minute > 9 ? minute : '0' + minute}:${second > 9 ? second : '0' + second}`;

  const day = current_date.get_day_of_year();
  const day_of_month = current_date.get_day_of_month();
  const year = current_date.get_year();
  const week = current_date.get_week_of_year();
  const month = current_date.get_month();

  const day_of_week = current_date.format('%A');
  const month_of_year = current_date.format('%B');
  const display_date =  `${day_of_week}, ${day_of_month} ${_("of")} ${month_of_year} ${_("of")} ${year}`
  const timestamp = Math.floor(create_timestamp(null, null, null) / 1000);

  return {
    time,
    day,
    day_of_month,
    year,
    week,
    month,
    display_date,
    timestamp,
  }
}


/**
 *
 * Send notification
 * @param {object} params
 * @param {Adw.Application} params.application
 * @param {Gio.Settings} params.settings
 *
 * @typered {object}
 * @property {Function} send
 *
 */
export const notification = ({ application, settings }) => {
  const notification = new Gio.Notification();

  /**
   *
   * Send notification
   *  @param {object} params
   * @param {string} params.title
   * @param {string} params.body
   *
   */
  const send = ({ title, body }) => {
    notification.set_title(title);
    notification.set_body(body);
    const high_priority_notify = settings.get_boolean('high-priority-notify');
    notification.set_priority(high_priority_notify ? Gio.NotificationPriority.URGENT : Gio.NotificationPriority.NORMAL);
    notification.set_default_action("app.open");
    application.send_notification("lunch-is-ready", notification);
  }

  return {
    send,
  }
}

/**
 *
 * Load timer status in background mode using portal
 * @typeref {object}
 * @property {Function} set_status
 *
 */
const set_background_status = () => {
  const portal = new Xdp.Portal();

  /**
   * Set Background status
   * @param {object} params
   * @param {string} params.message
   *
   */
  const set_status = ({ message  }) => {
    portal.set_background_status(message, null, (portal, result) => {
      portal.set_background_status_finish(result);
    });

  }

  return {
    set_status,
  }
}

/**
 *
 * Quit request dialog
 * @param {object} params
 * @param {Adw.Application} params.application
 * @param {timer} params.timer
 *
 */
const quit_request_dialog = ({ application, timer }) => {
  const open = () => {
    let dialog = new Adw.MessageDialog();
    const timer_data = timer();
    dialog.set_heading(_('Stop timer?'));
    dialog.set_transient_for(application.get_active_window());
    dialog.set_body(_('There is a running timer, wants to stop and exit the application?'));
    dialog.add_response('continue', _('Continue'));
    dialog.add_response('quit', _('Quit'));
    dialog.set_response_appearance('quit', Adw.ResponseAppearance.DESTRUCTIVE);

    dialog.connect('response', (dialog, id) => {
      if (id === 'quit') {
        timer_data.timer_state = 'stopped';
        setTimeout(() => {
          application.quit()
        }, 1000)
      }
    })

    if (timer_data.timer_state === 'running' || timer_data.timer_state == 'paused') {
      return dialog.present()
    }
    application.quit();
  }
  return {
    open,
  }
}

/**
 *
 * Load all utils methods
 * This function is using factory design pattern
 * @param {object} params
 * @param {Adw.Application} params.application
 * @typeref {object}
 * @property {ApplicationDbManager} application_db_manager
 * @property {Gio.Settings} setings
 * @property { pomodoro_time_utils } pomodoro_time_utils
 *
 */
export const utils = ({ application  }) => {
  const time_utils = pomodoro_time_utils();
  const settings = new Settings({ schema_id: pkg.name });
  const db_manager = new ApplicationDbManager({ settings });
  const sound = sound_player({ application, settings });
  const notify = notification({ application, settings });
  const item = new PomodoroItem({ db_manager, time_utils });
  const timer_instance = timer({ application, pomodoro_item: item, settings, sound, notification: notify });
  return {
    application_db_manager: db_manager,
    settings,
    pomodoro_time_utils: time_utils,
    pomodoro_item: item,
    sound,
    notification: notify,
    timer: timer_instance,
    background_status: set_background_status(),
    quit_request_dialog: quit_request_dialog({application, timer: timer_instance.get_data}),
    format_time,
  }
}
