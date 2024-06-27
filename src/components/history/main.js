/*
 * main.js
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
 *
 */

import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import { Db_item } from '../../db.js';
import Settings from '../../settings.js';
import { history_details } from '../history-details/main.js';
import Resource from './index.blp';

/**
 *
 * Create history component
 *
 * @param {Object} params
 * @param {Adw.Application} params.application
 *
 */
export const history  = ({ application }) => {
  const builder = new Gtk.Builder();
  const history_settings = new Settings({ schema_id: `${pkg.name}.History`});
  const application_db_manager = application.utils.application_db_manager;
  const time_utils = application.utils.time_utils();
  const view_settings = () => history_settings.get_string('view');
  const settings = new Settings({ schema_id: `${pkg.name}.History`});
  const get_history = {
    today: () => (application_db_manager.get_by_day(time_utils.day)),
    week: () => (application_db_manager.get_by_week(time_utils.week)),
    month: () => (application_db_manager.get_by_month(time_utils.month)),
    all: () => (application_db_manager.get()),
  };
  let data = get_history[view_settings()]();
  let selected_rows = [];

  builder.add_from_resource(Resource);

  const component = builder.get_object("component");
  const stack = builder.get_object("stack");
  const list_box = builder.get_object("list_box");
  const empty_history_message = builder.get_object("empty_history_message");
  const view_work_time = builder.get_object("view_work_time");
  const toggle_view_work_break_time_button = builder.get_object("toggle_view_work_break_time_button");
  const delete_button = builder.get_object("delete_button");
  const details_container = builder.get_object("details_container");
  const nav_view = builder.get_object("nav_view");
  const history_list_page = builder.get_object("history_list_page");
  const history_detail_page = builder.get_object("history_detail_page");

  const navigate = (page) => (nav_view.push(page));

  /**
   *
   * Create details page of history
   * @param {number} id
   *
   */
  const create_deatails_page = (item) => {
    details_container.set_child(history_details({
      application,
      id: item.id,
      title: item.title,
      parent: component,
      sessions: item.sessions,
      subtitle: item.display_date,
      work_time: item.work_time,
      break_time: item.break_time,
      description: item.description,
    }));
    navigate(history_detail_page);
  }

  /**
   *
   * Load display time
   *
   */
  const load_display_total_time = () => {
    let total_work_timer = 0;
    let total_break_timer = 0;
    if (selected_rows.length > 0) {
      total_work_timer = selected_rows.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
      total_break_timer = selected_rows.reduce((accumulator, current_value) => accumulator + current_value.break_time, 0);
    } else {
      total_work_timer = data.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
      total_break_timer = data.reduce((accumulator, current_value) => accumulator + current_value.break_time, 0);
    }

    if (toggle_view_work_break_time_button.get_active()) {
      toggle_view_work_break_time_button.get_style_context().remove_class('error');
      toggle_view_work_break_time_button.get_style_context().add_class('accent');
      toggle_view_work_break_time_button.set_tooltip_text(_('Work time'));
      toggle_view_work_break_time_button.set_label(application.utils.format_time(total_work_timer));
    } else {
      toggle_view_work_break_time_button.get_style_context().remove_class('accent');
      toggle_view_work_break_time_button.get_style_context().add_class('error');
      toggle_view_work_break_time_button.set_tooltip_text(_('Break time'));
      toggle_view_work_break_time_button.set_label(application.utils.format_time(total_break_timer));
    }
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
  const sort_history = (history_a, history_b, _data) => {
    const a = history_a;
    const b = history_b;
    if (history_settings.get_string('sort') === 'name') {
      return history_settings.get_string('order') === 'ascending' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    }
    return history_settings.get_string('order') === 'ascending' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
  }

  /**
   *
   * Called when history row selected
   * @param {create_row} row
   *
   */
  const on_select_row = (row) => {
    if (row.selected) {
      selected_rows.push(row)
    } else {
      selected_rows = selected_rows.filter((item) => item.id !== row.id);
    }
    load_display_total_time();
    if (selected_rows.length > 0) {
      delete_button.set_icon_name('user-trash-full-symbolic');
      delete_button.set_sensitive(true);
    } else {
      delete_button.set_icon_name('user-trash-symbolic');
      delete_button.set_sensitive(false);
    }
  }

  /**
   *
   * Create history row
   * @param {Db_item} item
   * @returns {Adw.ActionRow} row
   *
   */
  const create_row = (item) => {
    const row = new Adw.ActionRow();
    row.set_title(item.title);
    row.set_subtitle(item.display_date);
    const check_button = new Gtk.CheckButton();
    delete_button.set_icon_name('user-trash-symbolic');
    delete_button.get_style_context().add_class('error');
    const details_button = new Gtk.Image();
    details_button.set_from_icon_name('go-next-symbolic');
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
      create_deatails_page(item);
    });
    check_button.connect('toggled', (check_button) => {
      row.selected = check_button.get_active();
      on_select_row(row);
    })
    return row
  }

  const load_history_list = () => {
    stack.visible_child_name = "empty_history";
    list_box.remove_all();

    const dates = {
      today: _('today'),
      week: _('this week'),
      month: _('this month'),
    }
    const message = view_settings() === 'all' ? _('Empty history') : `${_('No pomodoro')} ${dates[view_settings()]}`;
    empty_history_message.set_label(message);
    selected_rows = [];
    load_display_total_time();

    if(data.length === 0) return;
    stack.visible_child_name = "history";
    list_box.set_sort_func(sort_history);
    const history_group = {};
    const history_data = [];

    data.forEach((data) => {
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
      list_box.append(create_row(item));
    });
  }

  /**
   *
   * Setup GAction methods
   *
   */
  const setup_gactions = () => {
    const history_action_group = new Gio.SimpleActionGroup();
    component.insert_action_group("history", history_action_group);

    const clear_action = new Gio.SimpleAction({ name: 'clear' });
    clear_action.connect('activate', (simple_action) => {
      application_db_manager.delete_all();
      load_history_list();
    })

    history_action_group.add_action(clear_action);
    history_action_group.add_action(settings.create_action('view'));
    history_action_group.add_action(settings.create_action('order'));
    history_action_group.add_action(settings.create_action('sort'));
    settings.connect('changed::view', () => {
      data = get_history[view_settings()]();
      load_history_list();
    });
    settings.connect('changed::order', () => {
      load_history_list();
      list_box.set_sort_func(sort_history)
    });
    settings.connect('changed::sort', () => {
      load_history_list();
      list_box.set_sort_func(sort_history)
    });
  }

  toggle_view_work_break_time_button.connect('clicked', () => load_display_total_time());
  delete_button.connect("clicked", () => {
    selected_rows.forEach((item) => {
      application_db_manager.delete(item.id);
      list_box.remove(item);
    });
    data = get_history[view_settings()]();
    selected_rows = [];
    load_history_list();
    delete_button.set_sensitive(false);
    delete_button.set_icon_name('user-trash-symbolic');
  });

  setup_gactions();
  load_history_list();
  return component;
}
