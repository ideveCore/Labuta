import GObject from 'gi://GObject';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';


export const PomodoroPreferences = GObject.registerClass({
  GTypeName: "PomodoroPreferences",
  Template: 'resource:///io/gitlab/idevecore/Pomodoro/ui/preferences.ui',
  InternalChildren: ['run_in_background'],
}, class PomodoroPreferences extends Adw.PreferencesWindow {
  constructor() {
    super();
    this.settings = new Gio.Settings({
      schema_id: 'io.gitlab.idevecore.Pomodoro',
      path: '/io/gitlab/idevecore/Pomodoro/',
    });
    this._run_in_background.set_active(this.settings.get_boolean('run-in-background'));
  }

  on_boolean_state_set(widget, state) {
    const setting = widget.get_name()
    if (setting === 'run-in-background') {
      this.settings.set_boolean(setting, state)
    }
  }
})
