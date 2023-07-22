/* history-page.js
 *
 * Copyright 2023 francisco
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
import Template from './history-row.blp' assert { type: 'uri' };

export default class HistoryRow extends Adw.ExpanderRow {
  static {
    GObject.registerClass({
      Template,
      InternalChildren: [
        'work_time',
        'break_time',
        'description',
        'counts',
        'selection',
      ],
    }, this);
  }
  constructor(history, item, index) {
    super();
    this.application = Gtk.Application.get_default();
    this.item = item;
    this.index = index;
    this.set_title(this.item.title.toString());
    this.set_subtitle(this.item.date.display_date.toString());
    this._work_time.set_text(this._format_time(this.item.work_time).toString());
    this._break_time.set_text(this._format_time(this.item.break_time).toString());
    this._description.set_subtitle(this.item.description.toString());
    this._counts.set_text(this.item.counts.toString());
    this.history = history;
    this.selected = false;
    this._selection.connect('toggled', (action, value) => {
      this.selected = this._selection.active;
      this.history._on_selected();
    })
  }

  _format_time(timer) {
    let hours = Math.floor(timer / 60 / 60)
    let minutes = Math.floor(timer / 60) % 60;
    let seconds = timer % 60;

    if (hours.toString().split('').length < 2) {
      hours = `0${hours}`
    }
    if (minutes.toString().split('').length < 2) {
      minutes = `0${minutes}`
    }
    if (seconds.toString().split('').length < 2) {
      seconds = `0${seconds}`
    }
    return `${hours}:${minutes}:${seconds}`
  }
  _on_remove_item() {
    this.application.data = this.application.data.filter((item) => item !== this.item);
    this.application.save_data();
    this.history.load_list();
  }
  _toggle_active_selection() {
    this._selection.set_visible(this.history.activated_selection)
  }
}
