import Gio from 'gi://Gio';
import GObject from 'gi://GObject';

/**
 * @class
 */


export default class Settings extends Gio.Settings {
  constructor(params) {
    super(params);
    this.instance = null;
  }

  static new() {
    /* Create a new instace of settings */
    const settings = new Settings({ schema_id: pkg.name })
    return settings.instance
  }
}

GObject.registerClass(Settings);
