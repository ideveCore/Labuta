import GObject from 'gi://GObject';
import Adw from 'gi://Adw';
import { Application, data } from './stores.js';
import { Application_data } from './utils.js';

export const PomodoroPreferences = GObject.registerClass({
  GTypeName: "PomodoroPreferences",
  Template: 'resource:///io/gitlab/idevecore/Pomodoro/ui/preferences.ui',
  InternalChildren: [],
}, class PomodoroPreferences extends Adw.PreferencesWindow {
  constructor() {
    super();
  }
})
