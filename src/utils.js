import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Notify from 'gi://Notify';
import GSound from 'gi://GSound';
import Adw from 'gi://Adw';
import { data, timer_state, settings } from './stores.js';

const gsound = new GSound.Context();
gsound.init(null);

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
  if (this._timer_state === 'running' || this._timer_state == 'paused')
    return dialog.present()
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
  constructor({ summary, body }) {
    this._summary = summary;
    this._body = body;
    Notify.init('com.gitlab.idevecore.Pomodoro');
    const notification = new Notify.Notification({
      summary: this._summary,
      body: this._body,
    })
    notification.show()
  }
}

export class Sound {
  constructor({ name, cancellable }) {
    this.name = name;
    this.cancellable = cancellable;
  }
  play() {
    return new Promise((resolve, reject) => {
      gsound.play_full(
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

const get_platform_data = (timestamp) => {
  return { 'desktop-startup-id': new GLib.Variant('s', '_TIME' + timestamp) };
}


export const activate_action = (action, parameter, timestamp) => {
  let wrapped_param = [];
  if (parameter)
    wrapped_param = [parameter];

  Gio.DBus.session.call(pkg.name,
    '/io/gitlab/idevecore/Pomodoro',
    'org.freedesktop.Application',
    'ActivateAction',
    new GLib.Variant('(sava{sv})', [action, wrapped_param,
      get_platform_data(timestamp)]),
    null,
    Gio.DBusCallFlags.NONE,
    -1, null, (connection, result) => {
      try {
        connection.call_finish(result)
      } catch (e) {
        log('Failed to launch application: ' + e);
      }
    });
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
