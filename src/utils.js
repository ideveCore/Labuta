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
import Gst from 'gi://Gst';

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



export class Sound {
  constructor({ settings }) {
    this._application = Gtk.Application.get_default();
    this._settings = JSON.parse(this._application.settings.get_string(settings))
    this.playbin = Gst.ElementFactory.make('playbin', 'playbin');
    this.playbin.set_property('volume', 1);
    this.playbin.set_property('mute', false);
    this.playbin.set_state(Gst.State.READY);

    if (this._application.settings.get_boolean('play-sounds')) {
      if (this._settings.type === 'freedesktop') {
        this._gsound_play(this._settings.uri, this._settings.repeat)
      } else {
        this._gst_play(this._settings.uri, this._settings.repeat)
      }
    }
  }
  _gsound_play(name, repeat) {
    const sound = new Promise((resolve, reject) => {
      this._application.gsound.play_full(
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
  _gst_play(uri, repeat) {
    this.playbin.set_property('uri', uri);
    this.bus = this.playbin.get_bus()
    this.bus.add_signal_watch()
    this.bus.connect('message::error', (error, message) => {
      log('Playback error:', message.parse_error())
    })
    this.bus.connect('message::eos', () => {
      this.playbin.set_state(Gst.State.READY)
      if (repeat > 1) {
        this._gst_play(uri, --repeat)
      }

    })
    this.playbin.set_state(Gst.State.PLAYING)
  }
  // mount_path() {
  //   const uri = `resource://${this._application.resource_base_path}/${this._sound_id}`
  //   this.playbin.set_property('uri', uri);
  // }
  // play() {
  //   this.bus = this.playbin.get_bus()
  //   this.bus.add_signal_watch()
  //   this.bus.connect('message::error', (error) => {
  //     log(`${error}`)
  //   })
  //   this.bus.connect('message::eos', () => {
  //     this.playbin.set_state(Gst.State.READY)
  //   })
  //   this.playbin.set_state(Gst.State.PLAYING)
  // }
}

