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

<<<<<<< HEAD
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import { data, timer_state, settings } from './stores.js';

export function close_request() {
  timer_state.subscribe((value) => {
    this._timer_state = value;
  })
  let dialog = new Adw.MessageDialog();
  dialog.set_heading(_('Stop timer?'));
  dialog.set_transient_for(this.active_window);
  dialog.set_body(_('There is a running timer, wants to stop and exit the application?'));
  dialog.add_response('continue', _('Continue'));
  dialog.add_response('exit', _('Exit'));
  dialog.set_response_appearance('exit', Adw.ResponseAppearance.DESTRUCTIVE);

  dialog.connect('response', (dialog, id) => {
    if (id === 'exit') {
      timer_state.update(() => 'stopped')
      setTimeout(() => {
        if (this.application)
          return this.application.quit()
        this.quit()
      }, 1000)
    }
  })
  if (this._timer_state === 'running' || this._timer_state == 'paused') {
    return dialog.present()
  }
  if (this.application)
    return this.application.quit()
  this.quit()
}

export class Application_data {
  constructor() {
    this.load_file()
  }
  save() {
    data.subscribe((value) => {
      this.destination_file.replace_contents(new Handler_json(value).to_json(), null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
    })
  }
  get() {
    try {
      const [, contents] = this.destination_file.load_contents(null);
      const decoder = new TextDecoder('utf-8');
      data.update(() => (new Handler_json(decoder.decode(contents)).to_js()));
    } catch (error) {
      this.destination_file.create(Gio.FileCreateFlags.NONE, null);
      this.destination_file.replace_contents(new Handler_json([]).to_json(), null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
      const [, contents] = this.destination_file.load_contents(null);
      const decoder = new TextDecoder('utf-8');
      data.update(() => (new Handler_json(decoder.decode(contents)).to_js()));
    }
  }
  load_file() {
    this.data_dir = GLib.get_user_config_dir();
    this.destination = GLib.build_filenamev([this.data_dir, 'data.json'])
    this.destination_file = Gio.File.new_for_path(this.destination)
  }
}

export class Handler_json {
  constructor(data) {
    this._data = data
  }
  to_json() {
    return JSON.stringify(this._data)
  }
  to_js() {
    return JSON.parse(this._data)
  }
}

export class Application_notify {
  constructor({ title, body }) {
    this.notification = new Gio.Notification();
    this.notification.set_title(title);
    this.notification.set_body(body);
    this.notification.set_default_action("app.notification-reply");
    this.application = Gtk.Application.get_default();
    this.application.send_notification("lunch-is-ready", this.notification);
  }
}

export class Sound {
  constructor({ name, cancellable }) {
    this.application = Gtk.Application.get_default();
    this.name = name;
    this.cancellable = cancellable;
  }
  play() {
    return new Promise((resolve, reject) => {
      this.application.gsound.play_full(
        { 'event.id': this.name },
        this.cancellable,
        (source, res) => {
          try {
            resolve(source.play_full_finish(res));
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  }
}

export const set_background_status = (message) => {
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

export const set_theme = () => {
  const style_manager = Adw.StyleManager.get_default()
  if (settings.get_string('theme') === 'default') {
    style_manager.set_color_scheme(Adw.ColorScheme.DEFAULT)
  } else if (settings.get_string('theme') === 'dark') {
    style_manager.set_color_scheme(Adw.ColorScheme.FORCE_DARK)
  } else {
    style_manager.set_color_scheme(Adw.ColorScheme.FORCE_LIGHT)
  }
}

export const format_timer = (timer) => {
=======


export const format_time = (timer) => {
>>>>>>> new-pomodoro
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
