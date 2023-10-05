/* history.js
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
import Adw from 'gi://Adw';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import { format_time } from '../../utils.js';
import { Db_item } from '../../db.js';
import Settings from '../../settings.js';
import HistoryDetails from '../history-details/history-details.js';
import Template from './history.blp' assert { type: 'uri' };

/**
 *
 * Create History window
 * @class
 *
 */
export class History extends Adw.PreferencesWindow {
  static {
    GObject.registerClass({
      Template,
      InternalChildren: [
        'toggle_view_work_break_time_button',
        'stack',
        'list_box',
        'leaflet',
        'details_page',
        'primary_menu',
        'delete_button',
        'empty_history_message',
      ]
    }, this);
  }
  /**
   *
   * Create a instance of History
   * @param {object} params
   * @param {Adw.Application} params.application
   *
   */
  constructor({ application }) {
    super({
      transient_for: application.get_active_window(),
    });
    this._application = application;
    this._utils = application.utils;
    this._selected_rows = [];
    this._view_work_time = true;
    this._settings = new Settings({ schema_id: `${pkg.name}.History`});

    this._toggle_view_work_break_time_button.connect('clicked', () => {
      this._view_work_time = this._toggle_view_work_break_time_button.get_active();
      this._load_display_total_time(this._data);
    });
    this._setup_gactions();
    this._load_history_list();
  }
  /**
   *
   * Setup GAction methods
   *
   */
  _setup_gactions() {
    this.history_action_group = new Gio.SimpleActionGroup();
    this.insert_action_group("history", this.history_action_group);

    const clear_action = new Gio.SimpleAction({ name: 'clear' });
    clear_action.connect('activate', (simple_action) => {
      this._application_db_manager.delete_all();
      this._load_history_list();
    })

    this.history_action_group.add_action(clear_action);
    this.history_action_group.add_action(this._settings.create_action('view'));
    this.history_action_group.add_action(this._settings.create_action('order'));
    this.history_action_group.add_action(this._settings.create_action('sort'));
    this._settings.connect('changed::view', () => {
      this._load_history_list();
    });
    this._settings.connect('changed::order', () => {
      this._load_history_list();
      this._list_box.set_sort_func(this._sort_history.bind(this))
    });
    this._settings.connect('changed::sort', () => {
      this._load_history_list();
      this._list_box.set_sort_func(this._sort_history.bind(this))
    });
  }

  /**
   *
   * Create history row
   * @param {Db_item} item
   * @returns {Adw.ActionRow} row
   *
   */
  _create_row(item) {
    const row = new Adw.ActionRow();
    row.set_title(item.title);
    row.set_subtitle(item.display_date);
    const check_button = new Gtk.CheckButton();
    const delete_button = new Gtk.Button({
      halign: Gtk.Align.CENTER,
      valign: Gtk.Align.CENTER,
    });
    delete_button.set_icon_name('user-trash-symbolic');
    delete_button.get_style_context().add_class('error');
    const details_button = new Gtk.Image();
    details_button.set_from_icon_name('go-next-symbolic');
    row.add_prefix(delete_button);
    row.add_prefix(check_button);
    row.add_suffix(details_button);
    row.set_activatable_widget(details_button);
    row.title = item.title;
    row.timestamp = item.timestamp;
    row.selected = false;
    row.work_time = item.work_time;
    row.break_time = item.break_time;
    row.id = item.id;
    row.connect('activated', (action_row) => {
      this._create_lealflet_deatails_page(item);
    });
    check_button.connect('toggled', (check_button) => {
      row.selected = check_button.get_active();
      this._on_select_row(row);
    })
    delete_button.connect('clicked', () => {
      this._data.delete(item.id);
      this._list_box.remove(row);
    });
    return row
  }

  /**
   *
   * Create details page of history
   * @param {number} id
   *
   */
  _create_lealflet_deatails_page(item) {
    const history_details = new HistoryDetails({
      id: item.id,
      title: item.title,
      parent: this,
      sessions: item.sessions,
      subtitle: item.display_date,
      work_time: item.work_time,
      break_time: item.break_time,
      description: item.description,
    });
    this._details_page.set_child(history_details);
    this._leaflet_navigate_forward();
  }

  /**
   *
   * Leaflet navigate back method
   *
   */
  _leaflet_navigate_back() {
    this._leaflet.navigate(Adw.NavigationDirection.BACK);
  }

  /**
   *
   * Leaflet navigate forward method
   *
   */
  _leaflet_navigate_forward() {
    this._leaflet.navigate(Adw.NavigationDirection.FORWARD);
  }

  /**
   *
   * Load history
   *
   */
  _load_history_list() {
    this._stack.visible_child_name = "empty_history";
    this._list_box.remove_all();
    const application_db_manager = this._utils.application_db_manager;
    const pomodoro_utils = this._utils.pomodoro_time_utils;
    const get_history = {
      today: () => (application_db_manager.get_by_day(pomodoro_utils.day)),
      week: () => (application_db_manager.get_by_week(pomodoro_utils.week)),
      month: () => (application_db_manager.get_by_month(pomodoro_utils.month)),
      all: () => (application_db_manager.get()),
    };

    let settings = this._settings.get_string('view');

    this.data = get_history[settings]();

    const message = settings === 'all' ? _('Empty history') : `${settings !== 'today' ? _('This') : ''} ${settings.charAt(0).toUpperCase() + settings.slice(1)} ${_('no pomodoro')}`;
    this._empty_history_message.set_label(message);
    this._selected_rows = [];
    this._load_display_total_time();


    if(this.data.length === 0) return;
    this._stack.visible_child_name = "history";
    this._list_box.set_sort_func(this._sort_history.bind(this));
    const history_group = {};
    const history_data = [];

    this.data.forEach((data) => {
      const id = `${data.title}${data.description}`;
      if (!history_group[id]) {
        history_group[id] = [];
      }
      history_group[id].push(data);
    });
    Object.values(history_group).map((data) => {
      if(data.length > 1) {
        history_data.push(data.reduce((accumulator, object) => {
          accumulator.sessions += object.sessions
          accumulator.work_time += object.work_time;
          accumulator.break_time += object.break_time;
          if(accumulator.timestamp < object.timestamp) {
            accumulator.day = object.day;
            accumulator.day_of_month = object.day_of_month;
            accumulator.year = object.year;
            accumulator.week = object.week;
            accumulator.month = object.month;
            accumulator.display_date = object.display_date;
            accumulator.timestamp = object.timestamp;
          }
          return accumulator;
        }));
      } else {
        history_data.push(data[0]);
      }
    });
    history_data.forEach((item) => {
      this._list_box.append(this._create_row(item));
    });
  }

  /**
   *
   * Set sort function in Gtk.ListBox
   * @param {this._create_row} history_a
   * @param {this._create_row} history_b
   * @param {*} _data
   * @returns {*}
   * @example Return sort function
   *
   */
  _sort_history(history_a, history_b, _data) {
    const a = history_a
    const b = history_b
    if (this._settings.get_string('sort') === 'name') {
      return this._settings.get_string('order') === 'ascending' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    }
    return this._settings.get_string('order') === 'ascending' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
  }

  /**
   *
   * Load display time
   *
   */
  _load_display_total_time() {
    let total_work_timer = 0;
    let total_break_timer = 0;
    if (this._selected_rows.length > 0) {
      total_work_timer = this._selected_rows.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
      total_break_timer = this._selected_rows.reduce((accumulator, current_value) => accumulator + current_value.break_time, 0);
    } else {
      total_work_timer = this.data.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
      total_break_timer = this.data.reduce((accumulator, current_value) => accumulator + current_value.break_time, 0);
    }

    if (this._view_work_time) {
      this._toggle_view_work_break_time_button.get_style_context().remove_class('error');
      this._toggle_view_work_break_time_button.get_style_context().add_class('accent');
      this._toggle_view_work_break_time_button.set_tooltip_text(_('Work time'));
      this._toggle_view_work_break_time_button.set_label(format_time(total_work_timer));
    } else {
      this._toggle_view_work_break_time_button.get_style_context().remove_class('accent');
      this._toggle_view_work_break_time_button.get_style_context().add_class('error');
      this._toggle_view_work_break_time_button.set_tooltip_text(_('Break time'));
      this._toggle_view_work_break_time_button.set_label(format_time(total_break_timer));
    }
  }

  /**
   *
   * Delete selectd history row
   *
   */
  _on_delete() {
    this._selected_rows.forEach((item) => {
      this._data.delete(item.id);
      this._list_box.remove(item);
    });
    this._selected_rows = [];
    this._load_display_total_time();
    this._delete_button.set_sensitive(false);
    this._delete_button.set_icon_name('user-trash-symbolic');
  }

  /**
   *
   * Called when history row selected
   * @param {ths._create_row} row
   *
   */
  _on_select_row(row) {
    if (row.selected) {
      this._selected_rows.push(row)
    } else {
      this._selected_rows = this._selected_rows.filter((item) => item.id !== row.id);
    }
    this._load_display_total_time();
    if (this._selected_rows.length > 0) {
      this._delete_button.set_icon_name('user-trash-full-symbolic');
      this._delete_button.set_sensitive(true);
    } else {
      this._delete_button.set_icon_name('user-trash-symbolic');
      this._delete_button.set_sensitive(false);
    }
  }
}
