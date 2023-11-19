/* timers.js
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
import GLib from 'gi://GLib';

/**
 *
 * Pomodorot timer
 * @param {object} params
 * @param {Adw.Application} params.application
 * @param {PomodoroItem} params.pomodoro_item
 * @param {Settings} params.settings
 * @param {object} params.sound_player
 * @param {object} params.notification
 *
 * @typeref {object}
 * @property {any} technique
 * @property {Function} pomodoro
 * @property {Function} flow_time
 * @property {Function} start
 * @property {Function} stop
 * @property {Function} reset
 * @property {Function} skip
 * @property {Function} connect
 * @property {object} data
 *
 */
export const timers = ({ application, pomodoro_item, settings, notification, sound_player }) => {

  const events = {
    start: [],
    pause: [],
    stop: [],
    run: [],
    end: [],
  }

  /**
   *
   * Invokes timer events
   * @param {string} event
   * @param {Function} callback
   *
   */
  const connect = (event, callback) => {
    events[event].push(callback);
  }


  /**
   *
   * Pomodoro timer
   * @param {object} params
   * @param {number} params.work_time
   * @param {number} params.break_time
   * @param {number} params.long_break
   * @param {number} params.sessions_long_break
   *
   * @typeref {object}
   * @property {Function} start
   * @property {Function} stop
   * @property {Function} reset
   * @property {Function} skip
   * @property {Function} get_data
   *
   */
  const pomodoro = ({ work_time, break_time, long_break, sessions_long_break }) => {
    let timer_state = 'stopped';
    let current_time = work_time;
    let current_break_time = break_time;

    /**
     *
     * Start timer
     *
     */
    const start = () => {
      if (timer_state === 'stopped') {
        current_time = work_time;
        current_break_time = break_time;
        timer_state = 'running';
        pomodoro_item.save();
        run();
        event('start');
      } else if (timer_state === 'paused') {
        event('start');
        timer_state = 'running';
      } else {
        event('pause');
        timer_state = 'paused';
      }
    }

    /**
     *
     * Reset timer method
     *
     */
    const reset = () => {
      current_time = work_time;
      current_break_time = break_time;
      timer_state = 'stopped';
      pomodoro_item.delete();
      event('stop');
    }

    /**
     *
     * Stop timer method
     *
     */
    const stop = () => {
      current_time = work_time;
      current_break_time = break_time;
      timer_state = 'stopped';
      pomodoro_item.update();
      pomodoro_item.default_item();
      event('stop');
    }

    /**
     *
     * SKip timer method
     *
     */
    const skip = () => {
      if (current_time > -1) {
        current_time = 1;
        timer_state = 'running';
      } else {
        current_time = work_time;
        current_break_time = break_time;
        finish_timer();
      }
    }

    /**
     *
     * Event listener
     * @param {string} event
     *
     */
    const event = (event) => {
      for (const listener of events[event]) {
        listener({ data: get_timer_data(), pomodoro_item: pomodoro_item.get });
      }
    }

    /**
     *
     * Format timer method
     *
     */
    const format_time = () => {
      let hours = Math.floor(Math.abs(current_time < 0 ? current_time + current_break_time : current_time) / 60 / 60)
      let minutes = Math.floor(Math.abs(current_time < 0 ? current_time + current_break_time : current_time) / 60) % 60;
      let seconds = Math.abs(current_time < 0 ? current_time + current_break_time : current_time) % 60;

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
     * Finish timer
     *
     */
    const finish_timer = () => {
      timer_state = 'paused';
      if (!application.get_active_window().visible)
        background_status.set_status({ message: `${_('Paused')}` });

      current_time = work_time;
      current_break_time = break_time;
      pomodoro_item.set = { sessions: application.utils.pomodoro_item.get.sessions + 1 };
      event('end');
      if (pomodoro_item.get.sessions === sessions_long_break) {
        current_break_time = long_break;
        pomodoro_item.set = { sessions: 0 };
      }
      if (settings.get_boolean('autostart')) {
        start();
      }
      pomodoro_item.update();
      notification.send({ title: `${_("Pomodoro finished")} - ${application.utils.pomodoro_item.get.title}`, body: `${_("Description")}: ${application.utils.pomodoro_item.get.description}\n${_("Created at")}: ${application.utils.pomodoro_item.get.display_date}` });
      sound_player.play({ sound_settings: 'timer-finish-sound' });
    }

    /**
     *
     * Run time
     *
     */
    const run = () => {
      GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
        if (timer_state === 'stopped') {
          return GLib.SOURCE_REMOVE
        }

        if (timer_state === 'paused') {
          if (!application.get_active_window().visible)
            background_status.set_status({ message: `${_('Paused')}` });
          return GLib.SOURCE_CONTINUE
        }

        if (current_time === work_time) {
          notification.send({ title: `${_("Pomodoro started")} - ${application.utils.pomodoro_item.get.title}`, body: `${_("Description")}: ${application.utils.pomodoro_item.get.description}\n${_("Created at")}: ${application.utils.pomodoro_item.get.display_date}` })
          sound_player.play({ sound_settings: 'timer-start-sound' });
        } else if (current_time === 0) {
          notification.send({ title: `${_("Pomodoro break time")} - ${application.utils.pomodoro_item.get.title}`, body: `${_("Description")}: ${application.utils.pomodoro_item.get.description}\n${_("Created at")}: ${application.utils.pomodoro_item.get.display_date}` })
          sound_player.play({ sound_settings: 'timer-break-sound' });
        }

        if (current_time > 0) {
          pomodoro_item.set = { work_time: application.utils.pomodoro_item.get.work_time + 1 };
        } else {
          pomodoro_item.set = { break_time: application.utils.pomodoro_item.get.break_time + 1 };
        }

        if (!application.get_active_window().visible)
          background_status.set_status({ message: `${current_time > 0 ? _('Work time') : _('Break time')}: ${format_time()}` });

        current_time--
        pomodoro_item.update();
        event('run');

        if (current_time > (current_break_time * -1)) {
          return GLib.SOURCE_CONTINUE
        }
        finish_timer();
        return GLib.SOURCE_CONTINUE
      })
    };
    /**
     *
     * Return timer data
     * @typedef {object}
     * @property {number} work_time
     * @property {number} break_time
     * @property {number} current_time
     * @property {string} formatted_time
     *
     */
    const get_timer_data = () => {
      return {
        timer_state,
        work_time,
        break_time,
        current_time,
        formatted_time: format_time(),
      }
    }

    return {
      start,
      stop,
      reset,
      skip,
      get_data: get_timer_data,
    }

  }

  /**
   *
   * Flow time timer
   * @param {object} params
   * @param {number} params.break_time_percentage
   *
   * @typeref {object}
   * @property {Function} start
   * @property {Function} stop
   * @property {Function} reset
   * @property {Function} skip
   * @property {Function} get_data
   *
   */
  const flow_time = ({ break_time_percentage }) => {
    let timer_state = 'stopped';
    let timer_stage = 'work_time';
    let current_time = 0;

    /**
     *
     * Start timer
     *
     */
    const start = () => {
      if (timer_state === 'stopped') {
        current_time = 0;
        timer_stage = 'work_time';
        timer_state = 'running';
        pomodoro_item.save();
        run();
        event('start');
      } else if (timer_state === 'paused') {
        event('start');
        timer_state = 'running';
      } else {
        event('pause');
        timer_state = 'paused';
      }
    }

    /**
     *
     * Reset timer method
     *
     */
    const reset = () => {
      current_time = 0;
      timer_state = 'stopped';
      timer_stage = 'work_time';
      pomodoro_item.delete();
      event('stop');
    }

    /**
     *
     * Stop timer method
     *
     */
    const stop = () => {
      current_time = 0;
      timer_state = 'stopped';
      timer_stage = 'work_time';
      pomodoro_item.update();
      pomodoro_item.default_item();
      event('stop');
    }

    /**
     *
     * SKip timer method
     *
     */
    const skip = () => {
      if (current_time > 10) {
        current_time = -Math.floor((break_time_percentage / 100 * current_time * 5));
        console.log(current_time)
        timer_state = 'running';
        timer_stage = "break_time";
        notification.send({ title: `${_("Pomodoro break time")} - ${application.utils.pomodoro_item.get.title}`, body: `${_("Description")}: ${application.utils.pomodoro_item.get.description}\n${_("Created at")}: ${application.utils.pomodoro_item.get.display_date}` })
        sound_player.play({ sound_settings: 'timer-break-sound' });
      } else {
        current_time = 0;
        timer_stage = "work_time";
        finish_timer();
      }
    }

    /**
     *
     * Event listener
     * @param {string} event
     *
     */
    const event = (event) => {
      for (const listener of events[event]) {
        listener({ data: get_timer_data(), pomodoro_item: pomodoro_item.get });
      }
    }

    /**
     *
     * Format timer method
     *
     */
    const format_time = () => {
      let hours = Math.floor(Math.abs(current_time) / 60 / 60)
      let minutes = Math.floor(Math.abs(current_time) / 60) % 60;
      let seconds = Math.abs(current_time) % 60;

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
     * Finish timer
     *
     */
    const finish_timer = () => {
      timer_state = 'paused';
      timer_stage = 'break_time';
      if (!application.get_active_window().visible)
        background_status.set_status({ message: `${_('Paused')}` });

      current_time = 0;
      pomodoro_item.set = { sessions: application.utils.pomodoro_item.get.sessions + 1 };
      event('end');
      if (settings.get_boolean('autostart')) {
        start();
      }
      pomodoro_item.update();
      notification.send({ title: `${_("Pomodoro finished")} - ${application.utils.pomodoro_item.get.title}`, body: `${_("Description")}: ${application.utils.pomodoro_item.get.description}\n${_("Created at")}: ${application.utils.pomodoro_item.get.display_date}` });
      sound_player.play({ sound_settings: 'timer-finish-sound' });
    }

    /**
     *
     * Run time
     *
     */
    const run = () => {
      GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
        if (timer_state === 'stopped') {
          return GLib.SOURCE_REMOVE
        }

        if (timer_state === 'paused') {
          if (!application.get_active_window().visible)
            background_status.set_status({ message: `${_('Paused')}` });
          return GLib.SOURCE_CONTINUE
        }

        if (current_time === 1) {
          notification.send({ title: `${_("Flow time started")} - ${application.utils.pomodoro_item.get.title}`, body: `${_("Description")}: ${application.utils.pomodoro_item.get.description}\n${_("Created at")}: ${application.utils.pomodoro_item.get.display_date}` });
          sound_player.play({ sound_settings: 'timer-start-sound' });
        }

        if (current_time > 0) {
          pomodoro_item.set = { work_time: application.utils.pomodoro_item.get.work_time + 1 };
        } else {
          pomodoro_item.set = { break_time: application.utils.pomodoro_item.get.break_time + 1 };
        }

        if (!application.get_active_window().visible)
          background_status.set_status({ message: `${current_time > 0 ? _('Work time') : _('Break time')}: ${format_time()}` });

        current_time++
        pomodoro_item.update();
        event('run');

        if (current_time !== 0) {
          return GLib.SOURCE_CONTINUE
        }
        finish_timer();
        return GLib.SOURCE_CONTINUE
      })
    };

    /**
     *
     * Return timer data
     * @typedef {object}
     * @property {number} work_time
     * @property {number} break_time
     * @property {number} current_time
     * @property {string} formatted_time
     *
     */
    const get_timer_data = () => {
      return {
        timer_state,
        timer_stage,
        current_time,
        formatted_time: format_time(),
      }
    }

    return {
      start,
      stop,
      reset,
      skip,
      get_data: get_timer_data,
    }
  }


  let technique = pomodoro({ work_time: 1500, break_time: 300, long_break: 900, sessions_long_break: 4 });

  return {
    technique,
    pomodoro,
    flow_time,
    start: technique.start,
    stop: technique.stop,
    reset: technique.reset,
    skip: technique.skip,
    connect,
    get_data: technique.get_timer_data,
  }
}
