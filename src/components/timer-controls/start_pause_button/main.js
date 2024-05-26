import Adw from 'gi://Adw?version=1';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';
import { start_timer } from '../../start-timer/main.js';
import Template from './index.blp' assert { type: 'uri' };

/**
 *
 * Create Button - start and pause timer
 * @class
 * @extends {Gtk.Button}
 *
 */
export default class StartPause extends Gtk.Button {
  static {
    GObject.registerClass({
      Template,
      GTypeName: 'StartPause',
      InternalChildren: [],
    }, this)
  }

  /**
   *
   * Create a instance of StartPause
   *
   */
  constructor() {
    super();
    this._application = Gtk.Application.get_default();
    this._timer = this._application.utils.timer;

    this._timer.connect('start', () => {
      this.get_style_context().remove_class("suggested-action");
      this.set_icon_name("media-playback-pause-symbolic");
    });
    this._timer.connect('pause', () => {
      this.get_style_context().add_class("suggested-action");
      this.set_icon_name("media-playback-start-symbolic");
    });
    this._timer.connect('end', () => {
      this.get_style_context().add_class("suggested-action");
      this.set_icon_name("media-playback-start-symbolic");
    });
    this._timer.connect('stop', () => {
      this.get_style_context().add_class("suggested-action");
      this.set_icon_name("media-playback-start-symbolic");
    });
  }

  _start_pause_timer() {
    if (this._timer.technique.get_data().timer_state === 'stopped') {
      start_timer({ application: this._application }).present(this._application.get_active_window());
    } else {
      this._timer.technique.start();
    }
  }
}
