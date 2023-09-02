/* Timer.js
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

import GLib from 'gi://GLib';
import Adw from 'gi://Adw';
import { Db_item } from './db.js';

/**
 *
 * Create timer
 * @class
 *
 */
export default class Timer {
  /**
   *
   * Create Timer instance
   * @param {Adw.ApplicationWindow} application 
   *
   */
  constructor(application) {
    this._application = application;
    this._listeners = [];
    this._start_listeners = []
    this._pause_listeners = [];
    this._stop_listeners = [];
    this._end_listeners = [];
    this._setting_listeners = [];
    this._data = {};
    this.data = {};
    this.timer_state = 'stopped';
    this.work_time = this._application.settings.get_int('work-time-st') * 60;
    this.current_work_time = this.work_time;
    this.break_time = this._application.settings.get_int('break-time-st') * 60;
    this.current_break_time = this.break_time;
    this.long_break = this._application.settings.get_int('long-break-st') * 60;
    this.sessions_long_break = this._application.settings.get_int('sessions-long-break');

    this._setup_settings();
  }
  /**
   *
   * Run time 
   *
   */
  _run() {
    GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
      if (this.timer_state === 'stopped') {
        return GLib.SOURCE_REMOVE
      }

      if (this.timer_state === 'paused') {
        return GLib.SOURCE_CONTINUE
      }

      if (this.current_work_time === this.work_time) {
        this._application._send_notification({ title: `${_("Pomodoro started")} - ${this.data.title}`, body: `${_("Description")}: ${this.data.description}\n${_("Created at")}: ${this.data.display_date}` })
        this._application._play_sound({ name: 'message-new-instant', cancellable: null });
      } else if (this.current_work_time === 0) {
        this._application._send_notification({ title: `${_("Pomodoro break time")} - ${this.data.title}`, body: `${_("Description")}: ${this.data.description}\n${_("Created at")}: ${this.data.display_date}` })
        this._application._play_sound({ name: 'complete', cancellable: null });
      }

      if (this.current_work_time > 0) {
        this.data.work_time = this.data.work_time + 1;
        if (!this._application.active_window.visible)
          this._application._load_background_portal_status(`${_('Work time')}: ${this.format_time()}`);
      } else {
        this.data.break_time = this.data.break_time + 1;
        if (!this._application.active_window.visible)
          this._application._load_background_portal_status(`${_('Break time')}: ${this.format_time()}`);
      }

      this.current_work_time--
      this.data = this._application.data.update(this.data)
      this.listener(this);

      if (this.current_work_time > (this.current_break_time * -1)) {
        return GLib.SOURCE_CONTINUE
      }

      this.timer_state = 'paused';
      this.current_work_time = this.work_time;
      this.current_break_time = this.break_time;
      this.data.sessions = this.data.sessions + 1;
      this._end_listener(this);
      if (this.data.sessions === this.sessions_long_break) {
        this.current_break_time = this.long_break;
        this.data.sessions = 0;
        this.data = this._application.data.update(this.data)
      }
      this._application._send_notification({ title: `${_("Pomodoro finished")} - ${this.data.title}`, body: `${_("Description")}: ${this.data.description}\n${_("Created at")}: ${this.data.display_date}` });
      this._application._play_sound({ name: 'alarm-clock-elapsed', cancellable: null });
      if (this._application.settings.get_boolean('autostart')) {
        setTimeout(() => {
          if (this.timer_state === 'paused') {
            this.start();
          }
        }, 6000);
      }
      return GLib.SOURCE_CONTINUE
    })
  };
  /**
  *
  * Start timer
  * @param {Db_item} data 
  *
  */
  start(data) {
    if (this.timer_state === 'stopped') {
      this.work_time = this._application.settings.get_int('work-time-st') * 60;
      this.current_work_time = this.work_time;
      this.break_time = this._application.settings.get_int('break-time-st') * 60;
      this.current_break_time = this.break_time;
      this.long_break = this._application.settings.get_int('long-break-st') * 60;
      this.sessions_long_break = this._application.settings.get_int('sessions-long-break');
      this.data = data
      this.timer_state = 'running';
      this._run();
      this._start_listener(this);
    } else if (this.timer_state === 'paused') {
      this._start_listener(this);
      this.timer_state = 'running';
    } else {
      this._pause_listener();
      this.timer_state = 'paused';
    }
  }

  /**
   * 
   * Reset timer method
   *
   */
  reset() {
    this.current_work_time = this.work_time;
    this.current_break_time = this.break_time;
    this.data = this._application.data.delete(this.data.id);
    this.timer_state = 'stopped';
    this._stop_listener(this);
  }
  /**
   *
   * Stop timer method
   *
   */
  stop() {
    this.work_time = this._application.settings.get_int('work-time-st') * 60;
    this.break_time = this._application.settings.get_int('break-time-st') * 60;
    this.long_break = this._application.settings.get_int('long-break-st') * 60;
    this.sessions_long_break = this._application.settings.get_int('sessions-long-break');
    this.current_work_time = this.work_time;
    this.current_break_time = this.break_time;
    this.timer_state = 'stopped';
    this.data = this._application.data.update(this.data);
    this._stop_listener(this);
    this.data = {};
  }
  /**
   *
   * Listerners
   *
   */
  $(listener) {
    this._listeners.push(listener);
  }
  $pause(listener) {
    this._pause_listeners.push(listener);
  }
  $end(listener) {
    this._end_listeners.push(listener);
  }
  $start(listener) {
    this._start_listeners.push(listener);
  }
  $stop(listener) {
    this._stop_listeners.push(listener);
  }
  $settings(listener) {
    this._setting_listeners.push(listener);
  }
  _setup_settings() {
    this._application.settings.connect("changed::work-time-st", () => {
      if (this.timer_state === 'stopped') {
        this.work_time = this._application.settings.get_int('work-time-st') * 60;
        this.current_work_time = this.work_time;
        this._setting_listener(this);
      }
    });
    this._application.settings.connect("changed::break-time-st", () => {
      if (this.timer_state === 'stopped') {
        this.break_time = this._application.settings.get_int('break-time-st') * 60;
        this.current_break_time = this.break_time;
      }
    });
    this._application.settings.connect("changed::long-break-st", () => {
      if (this.timer_state === 'stopped') {
        this.long_break = this._application.settings.get_int('long-break-st') * 60;
      }
    });
    this._application.settings.connect("changed::sessions-long-break", () => {
      if (this.timer_state === 'stopped') {
        this.sessions_long_break = this._application.settings.get_int('sessions-long-break');
      }
    });
  }
  _start_listener() {
    for (const listener of this._start_listeners) {
      listener(this);
    }
  }
  _pause_listener() {
    for (const listener of this._pause_listeners) {
      listener(this);
    }
  }
  _stop_listener() {
    for (const listener of this._stop_listeners) {
      listener(this);
    }
  }
  _end_listener() {
    for (const listener of this._end_listeners) {
      listener(this);
    }
  }
  _setting_listener() {
    for (const listener of this._setting_listeners) {
      listener(this);
    }
  }
  listener() {
    for (const listener of this._listeners) {
      listener(this);
    }
  }
  /**
   *
   * Format timer method
   *
   */
  format_time() {
    let hours = Math.floor(Math.abs(this.current_work_time < 0 ? this.current_work_time + this.current_break_time : this.current_work_time) / 60 / 60)
    let minutes = Math.floor(Math.abs(this.current_work_time < 0 ? this.current_work_time + this.current_break_time : this.current_work_time) / 60) % 60;
    let seconds = Math.abs(this.current_work_time < 0 ? this.current_work_time + this.current_break_time : this.current_work_time) % 60;

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
}
