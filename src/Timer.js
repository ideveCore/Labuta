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
import Gtk from 'gi://Gtk';
import { Db_item } from './db.js';
import { Sound, send_notification, load_timer_status_in_bg_mode } from './utils.js';
import PomodoroItem from './pomodoro-item.js';
import GSettings from './gsettings.js';

/**
 *
 * Timer
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
  constructor() {
    if(Timer.instance) {
      return Timer.instance;
    }
    Timer.instance = this
    this._application = Gtk.Application.get_default();
    this._pomodoro_item = new PomodoroItem();
    this._settings = new GSettings();
    this.timer_state = 'stopped';
    this.work_time = this._settings.get_int('work-time-st') * 60;
    this.current_work_time = this.work_time;
    this.break_time = this._settings.get_int('break-time-st') * 60;
    this.current_break_time = this.break_time;
    this.long_break = this._settings.get_int('long-break-st') * 60;
    this.sessions_long_break = this._settings.get_int('sessions-long-break');
    this._sound = new Sound();
    this._events = {
      start: [],
      pause: [],
      stop: [],
      run: [],
      end: [],
    };
    this._settings.change('timer_customization', () => {
      if (this.timer_state === 'stopped') {
        this.work_time = this._settings.get_int('work-time-st') * 60;
        this.current_work_time = this.work_time;
        this.break_time = this._settings.get_int('break-time-st') * 60;
        this.current_break_time = this.break_time;
        this.long_break = this._settings.get_int('long-break-st') * 60;
        this.sessions_long_break = this._settings.get_int('sessions-long-break');
      }
    })
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
        send_notification({ title: `${_("Pomodoro started")} - ${this._pomodoro_item.get.title}`, body: `${_("Description")}: ${this._pomodoro_item.get.description}\n${_("Created at")}: ${this._pomodoro_item.get.display_date}` })
        this._sound.play('timer-start-sound');
      } else if (this.current_work_time === 0) {
        send_notification({ title: `${_("Pomodoro break time")} - ${this._pomodoro_item.get.title}`, body: `${_("Description")}: ${this._pomodoro_item.get.description}\n${_("Created at")}: ${this._pomodoro_item.get.display_date}` })
        this._sound.play('timer-break-sound');
      }

      if (this.current_work_time > 0) {
        this._pomodoro_item.set = {work_time: this._pomodoro_item.get.work_time + 1};
      } else {
        this._pomodoro_item.set = {break_time: this._pomodoro_item.get.break_time + 1};
      }

      if(!this._application.get_active_window().visible)
        load_timer_status_in_bg_mode(`${this.current_work_time > 0 ? _('Work time') :  _('Break time')}: ${this.format_time()}`);

      this.current_work_time--
      this._pomodoro_item.update();
      this.event('run');

      if (this.current_work_time > (this.current_break_time * -1)) {
        return GLib.SOURCE_CONTINUE
      }
      this._finish_timer();
      return GLib.SOURCE_CONTINUE
    })
  };
  _finish_timer() {
    this.timer_state = 'paused';
    if(!this._application.get_active_window().visible)
      load_timer_status_in_bg_mode(`${_('Paused')}`);

    this.current_work_time = this.work_time;
    this.current_break_time = this.break_time;
    this._pomodoro_item.set = {sessions: this._pomodoro_item.get.sessions + 1};
    this.event('end');
    if (this._pomodoro_item.get.sessions === this.sessions_long_break) {
      this.current_break_time = this.long_break;
      this._pomodoro_item.set = {sessions: 0};
    }
    if (this._settings.get_boolean('autostart')) {
      this.start();
    }
    this._pomodoro_item.update();
    send_notification({ title: `${_("Pomodoro finished")} - ${this._pomodoro_item.get.title}`, body: `${_("Description")}: ${this._pomodoro_item.get.description}\n${_("Created at")}: ${this._pomodoro_item.get.display_date}` });
    this._sound.play('timer-finish-sound');
  }

  /**
   *
   * Start timer
   *
   */
  start() {
    if (this.timer_state === 'stopped') {
      this.work_time = this._settings.get_int('work-time-st') * 60;
      this.current_work_time = this.work_time;
      this.break_time = this._settings.get_int('break-time-st') * 60;
      this.current_break_time = this.break_time;
      this.long_break = this._settings.get_int('long-break-st') * 60;
      this.sessions_long_break = this._settings.get_int('sessions-long-break');
      this.timer_state = 'running';
      this._pomodoro_item.save();
      this._run();
      this.event('start');
    } else if (this.timer_state === 'paused') {
      this.event('start');
      this.timer_state = 'running';
    } else {
      this.event('pause');
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
    this.timer_state = 'stopped';
    this.event('stop');
    this._pomodoro_item.delete();
  }

  /**
   *
   * Stop timer method
   *
   */
  stop() {
    this.work_time = this._settings.get_int('work-time-st') * 60;
    this.break_time = this._settings.get_int('break-time-st') * 60;
    this.long_break = this._settings.get_int('long-break-st') * 60;
    this.sessions_long_break = this._settings.get_int('sessions-long-break');
    this.current_work_time = this.work_time;
    this.current_break_time = this.break_time;
    this.timer_state = 'stopped';
    this._pomodoro_item.update();
    this._pomodoro_item.default_item();
    this.event('stop');
  }

  /**
   *
   * Stop timer method
   *
   */
  skip() {
    if(this.current_work_time > -1) {
      this.current_work_time = 1;
      this.timer_state = 'running';
    } else {
      this.current_work_time = this.work_time;
      this._finish_timer();
    }
  }


  /**
   *
   * Invokes timer events
   * @param {string} event 
   * @param {Function} callback 
   *
   */
  connect(event, callback) {
    this._events[event].push(callback)
  }

  /**
   *
   * Event listener
   * @param {string} event
   *
   */
  event(event) {
    for(const listener of this._events[event]) {
      listener(this._pomodoro_item.get);
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
