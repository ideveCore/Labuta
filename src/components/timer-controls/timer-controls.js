/* timer-controls.js
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

import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import GLib from 'gi://GLib';
import { start_timer } from '../start-timer/main.js';
import Template from './timer-controls.blp' assert { type: 'uri' };

/**
 * Timer controls component
 *
 * @class
 * @extends {Gtk.Stack}
 *
 */
export class TimerControls extends Gtk.Stack {
  static {
    GObject.registerClass({
      GTypeName: 'TimerControls',
      Template,
      InternalChildren: [],
    }, this)
  }
  /**
   *
   * Create a instance of Timer Controls
   * @param {object} params
   * @param {Adw.Application} params.application
   *
   */
  constructor({ application }) {
    super();
    this._application = application;
    this._timer = application.utils.timer;
    this._pomodoro_item = application.utils.pomodoro_item;

    this._timer.connect('start', () => {
      this.visible_child_name = 'running_timer';
    });
    this._timer.connect('pause', () => {
      this.visible_child_name = 'paused_timer';
    });
    this._timer.connect('end', () => {
      this.visible_child_name = 'paused_timer';
    });
    this._timer.connect('stop', () => {
      this.visible_child_name = 'init_timer';
    });
  }

  /**
   *
   * Create pause or start timer method
   *
   */
  _on_start_pause_timer() {
    console.log(this._timer.technique.get_data().timer_state)
    if (this._timer.technique.get_data().timer_state === 'stopped') {
      start_timer({ application: this._application }).present();
    } else {
      this._timer.technique.start();
    }
  }

  /**
   *
   * Reset timer method
   *
   */
  _on_reset_timer() {
    this._timer.technique.reset();
  }

  /**
   *
   * Stop timer method
   *
   */
  _on_stop_timer() {
    this._timer.technique.stop();
  }

  /**
   *
   * Skip timer method
   *
   */
  _on_skip_timer() {
    this._timer.technique.skip();
  }

}

