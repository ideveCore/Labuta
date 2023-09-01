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
import HistoryDetails from '../../components/history-details/history-details.js';
import Template from './history.blp' assert { type: 'uri' };
import { format_time } from '../../utils.js';

export class History extends Adw.PreferencesWindow {
  static {
    GObject.registerClass({
      Template,
      InternalChildren: [
        'toggle_view_work_break_time_button',
        // 'history_scroll',
        // 'history_headerbox',
        // 'stack',
        'list_box',
        'leaflet',
        'details_page',
        'primary_menu',
        'delete_button',
      ]
    }, this);
  }
  constructor(application) {
    super({
      transient_for: application.get_active_window(),
    });
    this.Application = application;
    this._selected_rows = [];
    this._view_work_time = true;
    this._toggle_view_work_break_time_button.connect('clicked', () => {
      this._view_work_time = this._toggle_view_work_break_time_button.get_active();
      this._load_display_total_time(this.Application.data);
    });
    this._setup_gactions();
    this._load_history_list();
  }
  _setup_gactions() {
    this.search_action_group = new Gio.SimpleActionGroup();
    this.history_action_group = new Gio.SimpleActionGroup();
    this.insert_action_group("search", this.search_action_group);
    this.insert_action_group("history", this.history_action_group);

    const sorting_action = new Gio.SimpleAction({ name: 'sorting', parameter_type: new GLib.Variant('s', '').get_type() });
    const order_action = new Gio.SimpleAction({ name: 'order', parameter_type: new GLib.Variant('s', '').get_type() });
    const clear_action = new Gio.SimpleAction({ name: 'clear' });
    sorting_action.connect('activate', (simple_action, parameter) => {
      const sort = parameter.get_string()[0];
      this.Application.settings.set_string('sort-by', sort);
      this._list_box.set_sort_func(this._sort_history.bind(this))
    });
    order_action.connect('activate', (simple_action, parameter) => {
      const order = parameter.get_string()[0];
      this.Application.settings.set_string('order-by', order);
      this._list_box.set_sort_func(this._sort_history.bind(this))
    });
    clear_action.connect('activate', (simple_action) => {
      let id = 0
      this.Application.data.get().forEach((item, index) => {
        this.Application.data.delete(item.id)
        this._list_box.remove(this._list_box.get_row_at_index(index - id));
        id++
      });
      this._load_history_list();
    })

    this.search_action_group.add_action(sorting_action);
    this.search_action_group.add_action(order_action);
    this.history_action_group.add_action(clear_action);

  }
  _leaflet_navigate_back() {
    this._leaflet.navigate(Adw.NavigationDirection.BACK);
  }
  _leaflet_navigate_forward() {
    this._leaflet.navigate(Adw.NavigationDirection.FORWARD);
  }
  _create_lealflet_deatails_page(id) {
    const item = this.Application.data.get_by_id(id)[0];
    const details = new HistoryDetails({
      id: item.id,
      title: item.title,
      parent: this,
      sessions: item.sessions,
      subtitle: item.display_date,
      work_time: item.work_time,
      break_time: item.break_time,
      description: item.description,
    });
    // Remove existent details
    const exist_details = this._details_page.get_row_at_index(0)
    if (exist_details) this._details_page.remove(exist_details);
    this._details_page.append(details);

    this._leaflet_navigate_forward();
  }
  _sort_history(history_a, history_b, _data) {
    const a = history_a
    const b = history_b
    if (this.Application.settings.get_string('sort-by') === 'name') {
      return this.Application.settings.get_string('order-by') === 'ascending' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    }
    return this.Application.settings.get_string('order-by') === 'ascending' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
  }
  create_row(item) {
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
      this._create_lealflet_deatails_page(item.id);
    });
    check_button.connect('toggled', (check_button) => {
      row.selected = check_button.get_active();
      this._on_select_row(row);
    })
    delete_button.connect('clicked', () => {
      this.Application.data.delete(item.id);
      this._list_box.remove(row);
    });
    this._list_box.append(row);
  }
  _load_history_list() {
    if (this.Application.data.get().length === 0) return;
    // this._stack.visible_child_name = "history";
    this._list_box.set_sort_func(this._sort_history.bind(this));
    this.Application.data.get().forEach((item) => {
      this.create_row(item);
    })
    this._selected_rows = [];
    this._load_display_total_time();
  }
  _load_display_total_time() {
    let total_work_timer = 0;
    let total_break_timer = 0;
    if (this._selected_rows.length > 0) {
      total_work_timer = this._selected_rows.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
      total_break_timer = this._selected_rows.reduce((accumulator, current_value) => accumulator + current_value.break_time, 0);
    } else {
      total_work_timer = this.Application.data.get().reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
      total_break_timer = this.Application.data.get().reduce((accumulator, current_value) => accumulator + current_value.break_time, 0);
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
  _on_delete() {
    this._selected_rows.forEach((item) => {
      this.Application.data.delete(item.id);
      this._list_box.remove(item);
    });
    this._selected_rows = [];
    this._load_display_total_time();
    this._delete_button.set_sensitive(false);
    this._delete_button.set_icon_name('user-trash-symbolic');
  }
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

