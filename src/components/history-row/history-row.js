/* history-row.js
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
import Template from './history-row.blp' assert { type: 'uri' };
import { format_time } from '../../utils.js';

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
  constructor(item) {
    super();
    this.item = item;
    this.work_time = this.item.work_time;
    this.break_time = this.item.break_time;
    this.application = Gtk.Application.get_default();
    this.id = this.item.id
    // this.item = item;
    // this.index = index;
    this.set_title(this.item.title);
    this.set_subtitle(this.item.subtitle);
    this._work_time.set_text(format_time(item.work_time).toString());
    this._break_time.set_text(format_time(item.break_time).toString());
    this._description.set_subtitle(this.item.description);
    this._counts.set_text(this.item.counts);
    // this.history = history;
    // this.selected = false;
    // this._selection.connect('toggled', (action, value) => {
    //   this.selected = this._selection.active;
    //   this.history._on_selected();
    // })
    // this._work_time.set_text('djod');
    // this._break_time.set_text('wedhw');
    // this._description.set_subtitle('kwne');
    // this._counts.set_text('ekjdwo');
    // this.history = history;
    this.selected = false;
    this._selection.connect('toggled', (action, value) => {
      this.selected = this._selection.active;
      // console.log(this.child)
      // this.list_box.select_row(this)
      // this.set_activatable(true);
      // console.log(this.is_selected());
      // this._on_select_row(this.get_index(), this._selection.active);
    })

  }
  _on_remove_item() {
    this.application.data = this.application.data.filter((item) => item.id !== this.item.id);
    this.history._load_history_list();
    this.application._save_data();
  }
  _on_active_selection(mode) {
    this._selection.set_visible(mode)
  }
}
