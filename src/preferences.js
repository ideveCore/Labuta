import GObject from 'gi://GObject';
import Adw from 'gi://Adw';
import { settings } from './stores.js';
import { set_theme } from './utils.js';

export const PomodoroPreferences = GObject.registerClass({
  GTypeName: "PomodoroPreferences",
  Template: 'resource:///io/gitlab/idevecore/Pomodoro/ui/preferences.ui',
  InternalChildren: ['run_in_background', 'theme'],
}, class PomodoroPreferences extends Adw.PreferencesWindow {
  constructor() {
    super();
    this._run_in_background.set_active(settings.get_boolean('run-in-background'));
    this._theme.connect('notify', (sender, e) => {
      if (e.get_name() === 'selected-item') {
        this.change_theme(this._theme.get_selected_item().get_string())
      }
    })
  }

  change_theme(theme) {
    if (theme === 'Dark' || theme === "Light") {
      settings.set_string('theme', theme.toLowerCase())
    } else {
      settings.set_string('theme', 'default')
    }
    set_theme()
  }

  on_boolean_state_set(widget, state) {
    const setting = widget.get_name()
    if (setting === 'run-in-background') {
      settings.set_boolean(setting, state)
    }
  }
})
