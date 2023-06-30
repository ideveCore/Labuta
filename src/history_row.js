/* history_row.js
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
import Adw from 'gi://Adw';
import { data } from './stores.js';
import { Application_data } from './utils.js';

export const HistoryRow = GObject.registerClass({
  GTypeName: "HistoryRow",
  Template: 'resource:///io/gitlab/idevecore/Pomodoro/ui/history_row.ui',
  InternalChildren: [
    'work_time',
    'break_time',
    'description',
    'counts',
    'selection',
  ],
}, class HistoryRow extends Adw.ExpanderRow {
  constructor(history, item, index) {
    super();
    this.item = item;
    this.index = index;
    this.set_title(this.item.title.toString());
    this.set_subtitle(this.item.date.display_date.toString());
    this._work_time.set_text(this.format_timer(this.item.work_time).toString());
    this._break_time.set_text(this.format_timer(this.item.break_time).toString());
    this._description.set_subtitle(this.item.description.toString());
    this._counts.set_text(this.item.counts.toString());
    this.history = history;
    this.selected = false;
    this._selection.connect('toggled', (action, value) => {
      this.selected = this._selection.active
      this.history.on_selected()
    })
  }
  format_timer(timer) {
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
  remove_item() {
    data.subscribe((value) => {
      data.update(() => value.filter((item) => item !== this.item))
    })
    new Application_data().save()
    this.history.load_list()
  }
  toggle_active_selection() {
    this._selection.set_visible(this.history.activated_selection)
  }
})
