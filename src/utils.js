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
import GSound from 'gi://GSound';
import Gst from 'gi://Gst';
import GSettings from './gsettings.js';

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
export const format_time = (time) => {
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


/**
 *
 * Sound Player
 * @class
 *
 */
export class Alarm {
  constructor() {
    if (Alarm.instance) {
      return Alarm.instance;
    }
    Alarm.instance = this;
    this._application = Gtk.Application.get_default();
    this._settings = new GSettings();
    this._gsound = new GSound.Context();
    this._gsound.init(null);
    Gst.init(null);
    this.playbin = Gst.ElementFactory.make('playbin', 'playbin');
    this.playbin.set_property('volume', 1);
    this.playbin.set_property('mute', false);
    this.playbin.set_state(Gst.State.READY);
  }

  /**
   *
   * Play the sound
   * @param {string} settings 
   *
   */
  play(settings) {
    const song_data = JSON.parse(this._settings.get_string(settings))

    if (this._settings.get_boolean('play-sounds')) {
      if (song_data.type === 'freedesktop') {
        this._gsound_play(song_data.uri, song_data.repeat)
      } else {
        this._gst_play(song_data.uri, song_data.repeat)
      }
    }
  }

  /**
   *
   * Play sound using libgsound
   *
   * @param {string} name - name of sound
   * @param {number} repeat - counts for repeat sound
   *
   */
  _gsound_play(name, repeat) {
    new Promise((resolve, reject) => {
      this._gsound.play_full(
        { 'event.id': name },
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
        this._gsound_play(name, --repeat)
      }
    }).catch((error) => {
      console.log(error)
    })
  }

  /**
   * Play sound using libgst
   *
   * @param {string} uri - uri for sound file
   * @param {number} repeat - counts for repeat sound
   *
   */
  _gst_play(uri, repeat) {
    this.playbin.set_property('uri', uri);
    this.bus = this.playbin.get_bus()
    this.bus.add_signal_watch()
    this.bus.connect('message::error', (error, message) => {
      log('Bus error:', message.parse_error())
    })
    this.bus.connect('message::eos', () => {
      this.playbin.set_state(Gst.State.READY)
      if (repeat > 1) {
        this._gst_play(uri, --repeat)
      }
    })
    this.playbin.set_state(Gst.State.PLAYING)
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
 * @param {Object} notification
 * @param {string} notification.title
 * @param {string} notification.body
 *
 */
export const send_notification = ({ title, body }) => {
  const notification = new Gio.Notification();
  const application = Gtk.Application.get_default();
  notification.set_title(title);
  notification.set_body(body);
  notification.set_priority(Gio.NotificationPriority.URGENT);
  notification.set_default_action("app.open");
  application.send_notification("lunch-is-ready", notification);
}

/**
 *
 * Load timer status in background mode using portal
 * @param {string} message
 *
 */
export const load_timer_status_in_bg_mode = (message) => {
  const connection = Gio.DBus.session;
  const messageVariant = new GLib.Variant('(a{sv})', [{
    'message': new GLib.Variant('s', message)
  }]);
  connection.call(
    'org.freedesktop.portal.Desktop',
    '/org/freedesktop/portal/desktop',
    'org.freedesktop.portal.Background',
    'SetStatus',
    messageVariant,
    null,
    Gio.DBusCallFlags.NONE,
    -1,
    null,
    (connection, res) => {
      try {
        connection.call_finish(res);
      } catch (e) {
        if (e instanceof Gio.DBusError)
          Gio.DBusError.strip_remote_error(e);

        logError(e);
      }
    }
  );
}
