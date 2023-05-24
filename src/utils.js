import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Notify from 'gi://Notify'
import Gst from 'gi://Gst';
import { data, Application } from './stores.js';

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
  constructor({ id }) {
    this._sound_id = id;
    this.playbin = Gst.ElementFactory.make('playbin', 'playbin');
    this.playbin.set_property('volume', 1);
    this.playbin.set_property('mute', false);
    this.playbin.set_state(Gst.State.READY);
    Application.subscribe((value) => {
      this._application = value;
    })
    this.mount_path()
  }
  mount_path() {
    const uri = `resource://${this._application.resource_base_path}/${this._sound_id}`
    this.playbin.set_property('uri', uri);
  }
  play() {
    this.bus = this.playbin.get_bus()
    this.bus.add_signal_watch()
    this.bus.connect('message::error', (error) => {
      log(`${error}`)
    })
    this.bus.connect('message::eos', () => {
      this.playbin.set_state(Gst.State.READY)
    })
    this.playbin.set_state(Gst.State.PLAYING)
  }
}
