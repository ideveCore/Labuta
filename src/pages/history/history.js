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
import { format_time, History_list_model } from '../../utils.js';

export default class History extends Adw.Bin {
  static {
    GObject.registerClass({
      Template,
      InternalChildren: [
        'sort_history_dropdown',
        'sort_first_to_last_button',
        'sort_last_to_first_button',
        'toggle_view_work_break_time_button',
        'history_scroll',
        'history_headerbox',
        'stack',
        'list_box',
        'delete_button',
      ]
    }, this);
  }
  constructor() {
    super();
    this.application = Gtk.Application.get_default();
    this._list = [];
    this.sort_by = this.application.settings.get_int('sort-by');
    this.sort_first_to_last = this.application.settings.get_boolean('sort-first-to-last');
    this.activated_selection = false;
    this._sort_history_dropdown.set_model(Gtk.StringList.new([_("Sort By Name"), _("Sort By Date")]));
    this.view_work_time = true;
    this.set_selection = [];

    this._load_history_list();
    this._sort_history_dropdown.set_selected(this.sort_by);
    this._sort_history_dropdown.connect('notify::selected-item', () => {
      // this.application.settings.set_int('sort-by', this._sort_history_dropdown.get_selected());
      // let items = []
      // this.application.data.forEach((item, index) => {
      //   items.push(this._list_box.get_row_at_index(index));
      // })
      // items.forEach((item) => {
      //   this._list_box.remove(item);
      // })
      // this.sort_by = this.application.settings.get_int('sort-by');
      // this._list = [];
      // this._load_history_list();
    });
    this._sort_first_to_last_button.connect('clicked', () => {
      this.application.settings.set_boolean('sort-first-to-last', this._sort_first_to_last_button.get_active());
      this.sort_first_to_last = this.application.settings.get_boolean('sort-first-to-last');
      this._on_order_changed();
    });
    this._sort_last_to_first_button.connect('clicked', () => {
      this.application.settings.set_boolean('sort-first-to-last', this._sort_first_to_last_button.get_active());
      this.sort_first_to_last = this.application.settings.get_boolean('sort-first-to-last');
      this._on_order_changed();
    });
    this.history_scroll_adjustment = this._history_scroll.get_vadjustment();
    this.history_scroll_adjustment.connect('notify::value', (sender, e) => {
      if (this.history_scroll_adjustment.get_value() == 0.0) {
        this._history_headerbox.get_style_context().remove_class("history-header");
      }
      else {
        this._history_headerbox.get_style_context().add_class("history-header");
      }
    });
    this._toggle_view_work_break_time_button.connect('clicked', () => {
      this.view_work_time = this._toggle_view_work_break_time_button.get_active();
      this._load_display_total_time(this.application.data);
    });
    this._load_display_total_time(this.application.data);
  }
  _on_order_changed() {
    // let items = []
    // this.application.data.forEach((item, index) => {
    //   items.push(this._list_box.get_row_at_index(index));
    // })
    // items.forEach((item) => {
    //   this._list_box.remove(item);
    // })
    // this._list = [];
    // this._load_history_list();
  }
  _filter_history(item) {
    const search = '';
    const regex = new RegExp(search, 'i');

    // Use the RegExp.test() method to check if the pattern is found in the string
    const result = regex.test(item.name);

    // 'result' will be a boolean indicating whether the pattern was found or not
    return result;
  }
  _sort_history(history_a, history_b, _data) {
    const a = history_a.title
    const b = history_b.title
    return (a > b) - (a < b)

  }
  _create_history_row(item) {
    const row = new HistoryRow(this, item);
    this.set_selection.push(row._on_active_selection.bind(row));
    return row
  }
  _load_history_list() {
    const history_model = new History_list_model();
    history_model._append_history_item(this.application.data);

    const model = history_model;
    const filter = new Gtk.CustomFilter();
    filter.set_filter_func(this._filter_history);
    const sorter = new Gtk.CustomSorter(this._sort_history);
    const sorted_model = Gtk.SortListModel.new(model, sorter)
    const filter_model = Gtk.FilterListModel.new(sorted_model, filter)
    this._list_box.bind_model(filter_model, this._create_history_row.bind(this))

    // if (this.sort_by === 0) {
    //   this.application.data = this.application.data.sort((a, b) => a.title.localeCompare(b.title));
    // } else {
    //   this.application.data = this.application.data.sort((a, b) => a.date.day - b.date.day);
    // }

    // if (!this.sort_first_to_last) {
    //   this.application.data = this.application.data.slice(0).reverse();
    // }

    // this._load_display_total_time(this.application.data);
    // if (this.application.data.length === 0)
    //   return this._stack.visible_child_name = "no_history";

    this._stack.visible_child_name = "history";
    // if (this._list.length === 0) {
    //   this.application.data.forEach((item, index) => {
    //     const row = new HistoryRow(this, item, index);
    //     this._list_box.append(row);
    //     this._list.push({
    //       title: item.title,
    //       row: row,
    //     });
    //   });
    //   return
    // }
    // const remove_items = this._list.filter(element => this.application.data.findIndex(array_item => array_item.id === element.row.item.id) < 0);
    // this.application.data.forEach((item, index) => {
    //   const finded = this._list.find(array_item => array_item.row.item.id === item.id);
    //   if (finded)
    //     return
    //   const row = new HistoryRow(this, item, index);
    //   this._list_box.append(row);
    //   this._list.push({
    //     title: item.title,
    //     row: row,
    //   });
    // })
    // if (remove_items.length > 0) {
    //   remove_items.forEach((item) => {
    //     this._list_box.remove(item.row);
    //     this._list = this._list.filter((array_item) => array_item !== item);
    //   })
    // }
  }
  _load_display_total_time(time) {
    const total_work_timer = time.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
    const total_break_timer = time.reduce((accumulator, current_value) => accumulator + current_value.break_time, 0);

    if (this.view_work_time) {
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
    const selecteds = this._list.filter((item) => item.row.selected === true);
    const new_data = this.application.data.filter((item) => !(selecteds.find((selected_item) => selected_item.row.item === item) ? true : false));
    this.application.data = new_data;
    this.application.save_data();
    this._load_history_list();
    this._delete_button.set_sensitive(false);
    this._delete_button.set_icon_name('user-trash-symbolic');
    this._on_active_selection();
  }
  _on_selected() {
    const selecteds = this._list.filter((item) => item.row.selected === true);
    let value = [];
    selecteds.forEach((item) => {
      value.push(item.row.item);
    })
    this._load_display_total_time(value);
    if (value.length > 0) {
      this._delete_button.set_icon_name('user-trash-full-symbolic');
      this._delete_button.set_sensitive(true);
    } else {
      this._delete_button.set_icon_name('user-trash-symbolic');
      this._delete_button.set_sensitive(false);
    }
  }
  _on_active_selection() {
    this.activated_selection = !this.activated_selection;
    this.set_selection.forEach((item) => {
      item()
    })
    // this._list_box.forEach((item) => {
    //   console.log(item)
    // })
    // this._list.forEach((item) => {
    //   item.row._toggle_active_selection();
    // });
    // if (!this.activated_selection) {
    //   this._load_display_total_time(this.application.data);
    //   this._delete_button.set_visible(false);
    // } else {
    //   this._load_display_total_time([]);
    //   this._delete_button.set_visible(true);
    // }
  }
  _on_navigate() {
    this.application.active_window._navigate('timer');
  }
}
