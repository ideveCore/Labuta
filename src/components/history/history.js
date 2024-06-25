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
import { Db_item } from '../../db.js';
import Settings from '../../settings.js';
import { HistoryDetails } from '../history-details/history-details.js';
import Template from './history.blp' assert { type: 'uri' };

/**
 *
 * Create History window
 * @class
 *
 */
export class History extends Adw.Window {
  static {
    GObject.registerClass({
      Template,
      GTypeName: 'History',
      InternalChildren: [
        'leaflet',
        'primary_menu',
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
    this._application_db_manager = application.utils.application_db_manager;
    this._selected_rows = [];
    this._view_work_time = true;

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
   * Delete selectd history row
   *
   */
  _on_delete() {
    this._selected_rows.forEach((item) => {
      this._application_db_manager.delete(item.id);
      this._list_box.remove(item);
    });
    this._selected_rows = [];
    this._load_history_list();
    this._delete_button.set_sensitive(false);
    this._delete_button.set_icon_name('user-trash-symbolic');
  }
}
