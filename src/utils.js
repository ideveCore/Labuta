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
import { timers } from './timers.js';
import { gettext as _ } from 'gettext';

const decoder = new TextDecoder();

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
 * @param {Adw.Application} params.application
 * @param {Settings} params.settings
 *
 */
const sound_player = ({ application, settings }) => {
  const gsound = new GSound.Context();
  const default_settings = {
    "timer-start-sound": JSON.stringify({ type: 'freedesktop', uri: 'message-new-instant', repeat: 1 }),
    "timer-break-sound": JSON.stringify({ type: 'freedesktop', uri: 'complete', repeat: 1 }),
    "timer-finish-sound": JSON.stringify({ type: 'freedesktop', uri: 'alarm-clock-elapsed', repeat: 1 }),
  };
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
        gsound_player({ uri, repeat: --repeat })
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
        gst_player({ uri, repeat: --repeat });
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
  const play = ({ sound_settings }) => {
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

  /**
   *
   * Reset the sound settings
   * @param {object} params
   * @param {string} params.sound_settings
   *
   */
  const reset = ({ sound_settings }) => application.utils.settings.set_string(
    sound_settings,
    default_settings[sound_settings]
  );

  /**
   *
   * Setup actions
   *
   */
  const setup_actions = () => {
    const sound_group = new Gio.SimpleActionGroup();
    const play_action = new Gio.SimpleAction({ name: 'play', parameter_type: new GLib.Variant('s', '').get_type() });
    const reset_action = new Gio.SimpleAction({ name: 'reset', parameter_type: new GLib.Variant('s', '').get_type() });

    play_action.connect("activate", (simple_action, parameter) => {
      const sound_settings = parameter.get_string()[0];
      play({ sound_settings });
    });

    reset_action.connect("activate", (simple_action, parameter) => {
      const sound_settings = parameter.get_string()[0];
      reset({ sound_settings });
    });

    sound_group.add_action(play_action);
    sound_group.add_action(reset_action);
    application.get_active_window().insert_action_group('sound', sound_group);
  }

  return {
    play,
    reset,
    setup_actions,
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
  /**
   *
   * Send notification
   *  @param {object} params
   * @param {string} params.title
   * @param {string} params.body
   *
   */
  const send = ({ title, body }) => {
    const notification = new Gio.Notification();
    notification.set_title(title);
    notification.set_body(body);
    const high_priority_notify = settings.get_boolean('high-priority-notify');
    notification.set_priority(high_priority_notify ? Gio.NotificationPriority.URGENT : Gio.NotificationPriority.NORMAL);
    if (!application.get_active_window().visible) {
      notification.add_button(
        _("Launch"),
        "app.open",
      );
    }

    notification.set_default_action("app.open");
    application.send_notification("new-message", notification);
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
const background_status = () => {
  const portal = new Xdp.Portal();

  /**
   *
   * Set Background status
   * @param {object} params
   * @param {string} params.message
   *
   */
  const set_status = ({ message }) => {
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
const quit_request_dialog = ({ application }) => {
  const open = () => {
    let dialog = new Adw.MessageDialog();
    dialog.set_heading(_('Stop timer?'));
    dialog.set_transient_for(application.get_active_window());
    dialog.set_body(_('There is a running timer, wants to stop and exit the application?'));
    dialog.add_response('continue', _('Continue'));
    if(application.get_active_window().visible)
      dialog.add_response('hide', _('Hide'));
    dialog.add_response('quit', _('Quit'));
    dialog.set_response_appearance('continue', Adw.ResponseAppearance.SUGGESTED);
    dialog.set_response_appearance('quit', Adw.ResponseAppearance.DESTRUCTIVE);

    dialog.connect('response', (dialog, id) => {
      if (id === 'quit') {
        application.utils.timer.technique.get_data().timer_state = 'stopped';
        setTimeout(() => {
          application.quit()
        }, 1000)
      } else if(id == 'hide') {
        application.get_active_window().hide();
      }
    })

    if (application.utils.timer.technique.get_data().timer_state === 'running' ||
      application.utils.timer.technique.get_data().timer_state == 'paused') {
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
 * Get time utils
 *
 * @typedef {Object} time_utils
 * @property {string} time - current time
 * @property {number} day - current day
 * @property {number} day_of_month - current day of month
 * @property {string} day_of_week - current day of week
 * @property {number} year - current year
 * @property {number} week - current week
 * @property {number} month - current month
 * @property {string} month_of_year - current month of year
 * @property {number} timestamp - current timestamp
 *
 */
const time_utils = () => {
  const current_date = GLib.DateTime.new_now_local();
  const time = () => {
    const hour = new GLib.DateTime().get_hour();
    const minute = new GLib.DateTime().get_minute();
    const second = new GLib.DateTime().get_second();
    return `${hour > 9 ? hour : '0' + hour}:${minute > 9 ? minute : '0' + minute}:${second > 9 ? second : '0' + second}`;
  };

  const day = current_date.get_day_of_year();
  const day_of_month = current_date.get_day_of_month();
  const year = current_date.get_year();
  const week = current_date.get_week_of_year();
  const month = current_date.get_month();

  const day_of_week = current_date.format('%A');
  const month_of_year = current_date.format('%B');

  /**
   *
   * Create timestamp for pomodoro
   * @param {null|number} item_day
   * @param {null|number} item_year
   * @returns {number} return sum of current date hour, minutes, microseconds, year and day.
   *
   */
  const create_timestamp = () => {
    let time = new Date();
    const current_time = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
    return Math.floor(time.getTime() / 1000);
  };

  return {
    time: time(),
    day,
    day_of_month,
    day_of_week,
    year,
    week,
    month,
    month_of_year,
    timestamp: create_timestamp(),
  }
}

/**
 *
 * Save a file content
 *
 * @param {object} params
 * @param {Gtk.FileDialog} params.dialog A dialog to save file.
 * @param {Gtk.FileDialog} params.data A dialog to save file.
 *
 */
const save_file_content = async ({ dialog, data }) => {
  if(!data) return;
  let file_name;
  try {
    const file_info = dialog.query_info("standard::display-name", FileQueryInfoFlags.NONE);
    file_name = file_info.get_attribute_string("standard::display-name");
  } catch(_) {
    file_name = dialog.get_basename();
  }

  try {
    await dialog.replace_contents_bytes_async(
      new GLib.Bytes(JSON.stringify(data)),
      null,
      false,
      Gio.FileCreateFlags.NONE,
      null);
  } catch(e) {
    logError(`Unable to save ${file_name}: ${e.message}`)
  }
}

/**
 *
 * Read file contents
 * @param {Gtk.File} file
 * @param {string} default_value
 *
 */
const read_file = (file, defaultValue = '') => {
  try {
    const [success, data/*, tag*/] = file.load_contents(null)
    if (success) return decoder.decode(data)
    else throw new Error()
  } catch (e) {
    console.debug(e)
    return defaultValue
  }
}

/**
 *
 * Load all utils methods
 * @param {object} params
 * @param {Adw.Application} params.application
 *
 * @typeref {object}
 * @property {Gio.Settings} settings
 * @property {notification} notification
 * @property {sound_player} sound_player
 * @property {ApplicationDbManager} application_db_manager
 * @property {PomodoroItem} pomodoro_item
 * @property {Function} time_utils
 * @property {background_status} background_status
 * @property {quit_request_dialog} quit_request_dialog
 * @property {Function} format_time
 *
 */
export const utils = ({ application }) => {
  const settings = new Settings({ schema_id: pkg.name });
  const notification_instance = notification({ application, settings });
  const sound_player_instance = sound_player({ application, settings });
  const application_db_manager_instance = new ApplicationDbManager({ settings });
  const pomodoro_item_instance = new PomodoroItem({ application_db_manager: application_db_manager_instance, time_utils });
  const timer_instance = timers({ application, pomodoro_item: pomodoro_item_instance, sound_player: sound_player_instance, notification: notification_instance, settings: settings });
  return {
    settings,
    notification: notification_instance,
    sound_player: sound_player_instance,
    application_db_manager: application_db_manager_instance,
    pomodoro_item: pomodoro_item_instance,
    timer: timer_instance,
    time_utils: time_utils,
    background_status: background_status(),
    quit_request_dialog: quit_request_dialog({ application }),
    format_time,
    read_file,
    save_file_content,
  };
}
