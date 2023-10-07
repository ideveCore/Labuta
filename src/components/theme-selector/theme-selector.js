/* theme-selector.js
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

import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import Template from './theme-selector.blp' assert { type: 'uri' };
import Style from './theme-selector.css';
let provider;

/**
 *
 * Represents a ThemeSelector component.
 *
 * @class
 * @extends {Gtk.Box}
 *
 */
export class ThemeSelector extends Gtk.Box {
  static {
    GObject.registerClass({
      GTypeName: 'ThemeSelector',
      CssName: "themeselector",
      Template,
      InternalChildren: [
        'light',
        'system',
        'dark',
      ],
      Properties: {
        show_system: GObject.ParamSpec.boolean(
          "show-system",
          "Show system",
          "Show system",
          GObject.ParamFlags.READWRITE,
          true,
        ),
        selected_color_scheme: GObject.ParamSpec.string(
          "selected_color_scheme",
          "Select color scheme",
          "Select color scheme",
          GObject.ParamFlags.READWRITE,
          '',
        ),
      },
    }, this)
  }

  /**
   *
   * Create a instance for application theme handler.
   * @param {object} params
   * @param {Adw.Application} params.application
   *
   */
  constructor({ application }) {
    super();
    this.color_scheme = 'ligth';
    this.style_manager = Adw.StyleManager.get_default();
    this._settings = application.utils.settings;
    this.color_scheme = this._settings.get_string('color-scheme');

    this._settings.bind(
      'color-scheme',
      this,
      'selected_color_scheme',
      Gio.SettingsBindFlags.DEFAULT
    )
    this.style_manager.bind_property(
      'system-supports-color-schemes',
      this, 'show_system',
      GObject.BindingFlags.SYNC_CREATE
    )
    if (!provider) {
      provider = new Gtk.CssProvider();
      provider.load_from_resource(Style);
      Gtk.StyleContext.add_provider_for_display(
        Gdk.Display.get_default(),
        provider,
        Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION,
      );
    }
  }

  /**
   * Get the color_scheme value
   *
   * @returns {string} light|dark|auto
   */
  get selected_color_scheme() {
    return this.color_scheme
  }

  /**
   * set the color_scheme value into application
   *
   * @param {string} color_scheme light|dark|auto
   */
  set selected_color_scheme(color_scheme) {
    this.color_scheme = color_scheme;
    this.notify('selected_color_scheme');
    if (color_scheme === 'auto') {
      this._system.active = true
      this.style_manager.color_scheme = Adw.ColorScheme.PREFER_LIGHT
    }
    if (color_scheme == 'light') {
      this._light.active = true
      this.style_manager.color_scheme = Adw.ColorScheme.FORCE_LIGHT
    }
    if (color_scheme == 'dark') {
      this._dark.active = true
      this.style_manager.color_scheme = Adw.ColorScheme.FORCE_DARK

    }
  }

  /**
   * handler for options when selected
   *
   * @param {any} _widget
   * @param {any} _paramspec
   */
  _on_color_scheme_changed(_widget, _paramspec) {
    if (this._system.active) {
      this.selected_color_scheme = 'auto'
    }
    if (this._light.active) {
      this.selected_color_scheme = 'light'
    }
    if (this._dark.active) {
      this.selected_color_scheme = 'dark'
    }
  }
};
