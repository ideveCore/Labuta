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
import HistoryRow from '../../components/history-row/history-row.js';
import Template from './history.blp' assert { type: 'uri' };
import { format_time } from '../../utils.js';

export default class History extends Adw.Bin {
  static {
    GObject.registerClass({
      Template,
      InternalChildren: [
        'stack',
        'list_box',
        'total_work_time',
        'total_break_time',
        'delete_button',
        'sorting_button_content',
      ]
    }, this);
  }
  constructor() {
    super();
    this.application = Gtk.Application.get_default();
    this._list = [];
    this.sort_by = this.application.settings.get_string('sort-by');
    this.order_by = this.application.settings.get_string('order-by');
    const load = new Gio.SimpleAction({ name: 'load' });
    const action_group = new Gio.SimpleActionGroup();
    action_group.insert(load);
    this.activated_selection = false;
    const sort_action_group = new Gio.SimpleActionGroup();
    this.insert_action_group('sort', sort_action_group);
    const sort_action = new Gio.SimpleAction({ name: 'sort', parameter_type: new GLib.VariantType('s') });
    const order_action = new Gio.SimpleAction({ name: 'order', parameter_type: new GLib.VariantType('s') });
    sort_action_group.add_action(sort_action);
    sort_action_group.add_action(order_action);

    const load_sorting_button_content = () => {
      this._sorting_button_content.set_label(_(this.capitalize(this.sort_by)));
      this._sorting_button_content.set_icon_name(this.order_by === 'ascending' ? 'view-sort-ascending-symbolic' : 'view-sort-descending-symbolic');
    }

    load_sorting_button_content()

    sort_action.connect('activate', (action, parameter) => {
      let items = []
      this.application.data.forEach((item, index) => {
        items.push(this._list_box.get_row_at_index(index))
      })
      items.forEach((item) => {
        this._list_box.remove(item)
      })
      let sort_by = parameter.deep_unpack();
      this.application.settings.set_string('sort-by', sort_by);
      this.sort_by = this.application.settings.get_string('sort-by');
      load_sorting_button_content()
      this._list = []
      this.load_list()
    });

    order_action.connect('activate', (action, parameter) => {
      let items = []
      this.application.data.forEach((item, index) => {
        items.push(this._list_box.get_row_at_index(index))
      })
      items.forEach((item) => {
        this._list_box.remove(item)
      })
      let sort_by = parameter.deep_unpack();
      this.application.settings.set_string('order-by', sort_by);
      this.order_by = this.application.settings.get_string('order-by');
      load_sorting_button_content()
      this._list = []
      this.load_list()
    })
    this.load_list();
  }
  load_list() {
    if (this.sort_by === 'name') {
      this.application.dat = this.application.data.sort((a, b) => a.title.localeCompare(b.title))
    } else if (this.sort_by === 'date') {
      this.application.data = this.application.data.sort((a, b) => a.date.day - b.date.day);
    }

    if (this.order_by === 'descending') {
      this.application.data = this.application.data.slice(0).reverse()
    }

    this.load_time(this.application.data);
    if (this.application.data.length === 0)
      return this._stack.visible_child_name = "no_history";

    this._stack.visible_child_name = "history";
    if (this._list.length === 0) {
      this.application.data.forEach((item, index) => {
        const row = new HistoryRow(this, item, index);
        this._list_box.append(row);
        this._list.push({
          title: item.title,
          row: row,
        })
      });
      return
    }
    const remove_items = this._list.filter(element => this.application.data.findIndex(array_item => array_item.id === element.row.item.id) < 0);
    this.application.data.forEach((item, index) => {
      const finded = this._list.find(array_item => array_item.row.item.id === item.id);
      if (finded)
        return
      const row = new HistoryRow(this, item, index);
      this._list_box.append(row);
      this._list.push({
        title: item.title,
        row: row,
      })
    })
    if (remove_items.length > 0) {
      remove_items.forEach((item) => {
        this._list_box.remove(item.row)
        this._list = this._list.filter((array_item) => array_item !== item)
      })
    }
  }
  load_time(time) {
    const total_work_timer = time.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
    const total_break_timer = time.reduce((accumulator, current_value) => accumulator + current_value.break_time, 0);
    this._total_work_time.set_text(`${_("Total work")}: ${format_time(total_work_timer)}`)
    this._total_break_time.set_text(`${_("Total break")}: ${format_time(total_break_timer)}`)
  }
  capitalize(str, lower = false) {
    return (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
  }
  _on_delete() {
    const selecteds = this._list.filter((item) => item.row.selected === true);
    const new_data = this.application.data.filter((item) => !(selecteds.find((selected_item) => selected_item.row.item === item) ? true : false));
    this.application.data = new_data;
    this.application.save_data();
    this.load_list();
    this._delete_button.set_sensitive(false)
    this._delete_button.set_icon_name('user-trash-symbolic');
    this._active_selection();
  }
  _active_selection() {
    console.log("selected");
  }
  _on_active_selection() {
    console.log("selected");
  }
  _on_navigate() {
    this.application.active_window.navigate('timer')
  }
}
