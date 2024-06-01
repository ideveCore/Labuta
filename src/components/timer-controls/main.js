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
 *
 */

/**
 *
 * @class TimerControlsScope
 * @extends GObject.Object
 * @implements {Gtk.BuilderScope}
 *
 */
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import GLib from 'gi://GLib';
import { start_timer } from '../start-timer/main.js';
import Resource from './index.blp';

const TimerControlsScope = GObject.registerClass(
  {
    Implements: [Gtk.BuilderScope],
  },
  class TimerControlsScope extends GObject.Object {
    /**
     *
     * Creates a closure for a template signal handler.
     *
     * @param {Gtk.Builder} builder The builder object.
     * @param {string} handlerName The name of the template signal handler.
     * @param {Gtk.BuilderClosureFlags} flags Flags for the closure.
     * @param {GObject} connectObject The object to connect the signal to.
     * @returns {Function} The closure for the template signal handler.
     *
     */
    vfunc_create_closure(builder, handlerName, flags, connectObject) {
      if (flags & Gtk.BuilderClosureFlags.SWAPPED)
        throw new Error('Unsupported template signal flag "swapped"');

      if (typeof this[handlerName] === "undefined")
        throw new Error(`${handlerName} is undefined`);

      return this[handlerName].bind(connectObject || this);
    }
    /**
     *
     * Creates a new TimerControlsScope instance.
     *
     * @param {object} options
     * @param {Adw.Application} options.application The application object.
     * @param {object} options.timer The timer object.
     *
     */
    constructor({ application, timer }) {
      super();
      this._timer = timer;
      this._application = application;
    }
    /**
     *
     * Starts or pauses the timer.
     *
     * If the timer is stopped, starts it. Otherwise, pauses it.
     *
     */
    _on_start_pause_timer() {
      if (this._timer.technique.get_data().timer_state === 'stopped') {
        start_timer({ application: this._application }).present(this._application.get_active_window());
      } else {
        this._timer.technique.start();
      }
    }
    /**
     *
     * Skips the timer to the next interval.
     *
     */
    _skip_timer() {
      this._timer.technique.skip();
    }
    /**
     *
     * Resets the timer to its initial state.
     *
     */
    _reset_timer() {
      this._timer.technique.reset();
    }
    /**
     *
     * Stops the timer.
     *
     */
    _stop_timer() {
      this._timer.technique.stop();
    }
  }
);

/**
 *
 * Creates and returns a timer controls component.
 *
 * @param {GObject.Application} application The application object.
 * @returns {Gtk.Widget} The timer controls component.
 *
 */
export const timer_controls = ({ application }) => {
  const builder = new Gtk.Builder();

  builder.set_scope(new TimerControlsScope({ application, timer: application.utils.timer }));
  builder.add_from_resource(Resource);

  const pomodoro_item = application.utils.pomodoro_item;
  const component = builder.get_object("component");

  application.utils.timer.connect('start', () => {
    component.visible_child_name = 'running_timer';
  });
  application.utils.timer.connect('pause', () => {
    component.visible_child_name = 'paused_timer';
  });
  application.utils.timer.connect('end', () => {
    component.visible_child_name = 'paused_timer';
  });
  application.utils.timer.connect('stop', () => {
    component.visible_child_name = 'init_timer';
  });

  return component;
}
