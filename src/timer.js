/* timer.js
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
import Gdk from 'gi://Gdk';
import Template from './ui/timer.blp' assert { type: 'uri' };

export default class Timer extends Adw.Bin {
  static {
    GObject.registerClass({
      Template,
      InternalChildren: ["tag_label", "tag_area"],
    }, this);
  }
  constructor() {
    super();
    var sizeGroup = new Gtk.SizeGroup(Gtk.SizeGroupMode.Horizontal);
    sizeGroup.add_widget(this._tag_area);
    sizeGroup.add_widget(this._tag_label);
    // var fgcolor = luma > 0.5 ? "#000000cc" : "#ffffff";
    this._tag_label.set_label(`<span weight="bold" size="9pt">2</span>`);
    this._tag_area.set_draw_func(this._DrawTag);
  }
  _on_handler_timer() {
    console.log('handler timer');
  }
  _on_reset_timer() {
    console.log('reset timer');
  }
  _on_stop_timer() {
    console.log('stop timer');
  }
  _DrawTag(area, cr, width, height) {
    const color = new Gdk.RGBA();
    color.parse('rgba(220 ,20 ,60 , 1)');
    Gdk.cairo_set_source_rgba(cr, color);
    cr.arc(height / 2, height / 2, height / 2, 0.5 * Math.PI, 1.5 * Math.PI);
    cr.arc(width - height / 2, height / 2, height / 2, -0.5 * Math.PI, 0.5 * Math.PI);
    cr.closePath();
    cr.fill();
  }
}

