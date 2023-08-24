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
        'active_selection_button',
      ]
    }, this);
  }
  constructor() {
    super();
    this.application = Gtk.Application.get_default();
    this.selected_rows = [];
    this.sort_by = this.application.settings.get_int('sort-by');
    this.sort_first_to_last = this.application.settings.get_boolean('sort-first-to-last');
    this.activated_selection = false;
    this._sort_history_dropdown.set_model(Gtk.StringList.new([_("Sort by name"), _("Sort by date")]));
    this._sort_first_to_last_button.set_active(this.sort_first_to_last);
    this.view_work_time = true;
    this._sort_history_dropdown.set_selected(this.sort_by);
    this._sort_history_dropdown.connect('notify::selected-item', () => {
      this.application.settings.set_int('sort-by', this._sort_history_dropdown.get_selected());
      this.sort_by = this.application.settings.get_int('sort-by');
      this._load_history_list();
    });
    this._sort_first_to_last_button.connect('clicked', () => {
      this.application.settings.set_boolean('sort-first-to-last', this._sort_first_to_last_button.get_active());
      this.sort_first_to_last = this.application.settings.get_boolean('sort-first-to-last');
      this._load_history_list()
    });
    this._sort_last_to_first_button.connect('clicked', () => {
      this.application.settings.set_boolean('sort-first-to-last', this._sort_first_to_last_button.get_active());
      this.sort_first_to_last = this.application.settings.get_boolean('sort-first-to-last');
      this._load_history_list();
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
    this._active_selection_button.connect('clicked', () => {
      this.activated_selection = !this.activated_selection;
      this._on_active_selection();
    });
    this._load_history_list();
  }
  _filter_history(item) {
    const search = '';
    const regex = new RegExp(search, 'i');
    const result = regex.test(item.title);
    return result;
  }
  _sort_history(history_a, history_b, _data) {
    const a = history_a
    const b = history_b
    if (this.sort_by === 0) {
      return this.sort_first_to_last ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    }

    return this.sort_first_to_last ? a.day - b.day : b.day - a.day;
  }
  _create_history_row(item) {
    const row = new HistoryRow(item);
    row._selection.connect('toggled', (checkButton) => {
      row.selected = checkButton.get_active();
      this._on_select_row(row);
    })
    row._remove_item_button.connect('clicked', () => {
      this.application.data.delete(row.id);
      this._list_box.remove(row);
    })
    return row
  }
  _load_history_list() {
    if (this.application.data.length === 0) return;
    this._stack.visible_child_name = "history";
    const history_model = new History_list_model();
    history_model._append_history_item(this.application.data.get());
    const model = history_model;
    const filter = new Gtk.CustomFilter();
    filter.set_filter_func(this._filter_history);
    const sorter = Gtk.CustomSorter.new(this._sort_history.bind(this));
    const sorted_model = Gtk.SortListModel.new(model, sorter)
    const filter_model = Gtk.FilterListModel.new(sorted_model, filter)
    this._list_box.bind_model(filter_model, this._create_history_row.bind(this));
    this.activated_selection = false;
    this.selected_rows = [];
    this._on_active_selection();
    this._load_display_total_time();
  }
  _load_display_total_time() {
    let total_work_timer = 0;
    let total_break_timer = 0;
    if (this.selected_rows.length > 0 && this.activated_selection) {
      total_work_timer = this.selected_rows.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
      total_break_timer = this.selected_rows.reduce((accumulator, current_value) => accumulator + current_value.break_time, 0);
    } else {
      total_work_timer = this.application.data.get().reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
      total_break_timer = this.application.data.get().reduce((accumulator, current_value) => accumulator + current_value.break_time, 0);
    }

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
    this.selected_rows.forEach((item) => {
      this.application.data.delete(item.id);
      this._list_box.remove(item);
    });
    this._load_display_total_time();
    this.application._save_data();
    this._delete_button.set_sensitive(false);
    this._delete_button.set_icon_name('user-trash-symbolic');
    this._on_active_selection();
  }
  _on_select_row(row) {
    if (row.selected) {
      this.selected_rows.push(row)
    } else {
      this.selected_rows = this.selected_rows.filter((item) => item.id !== row.id);
    }
    this._load_display_total_time();
    if (this.selected_rows.length > 0) {
      this._delete_button.set_icon_name('user-trash-full-symbolic');
      this._delete_button.set_sensitive(true);
    } else {
      this._delete_button.set_icon_name('user-trash-symbolic');
      this._delete_button.set_sensitive(false);
    }
  }
  _on_active_selection() {
    for (let index = 0; index <= this.application.data.get().length - 1; index++) {
      this._list_box.get_row_at_index(index)._on_active_selection(this.activated_selection);
    }
    this._load_display_total_time();
    if (!this.activated_selection) {
      this._delete_button.set_visible(false);
    } else {
      this._delete_button.set_visible(true);
    }
  }
  _on_navigate() {
    this.application.active_window._navigate('timer');
  }
}
