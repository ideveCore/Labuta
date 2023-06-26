import GObject from 'gi://GObject';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import { HistoryRow } from './history_row.js';
import { data } from './stores.js';
import { activate_action } from './utils.js';


export const History = GObject.registerClass({
  GTypeName: "History",
  Template: 'resource:///io/gitlab/idevecore/Pomodoro/ui/history.ui',
  InternalChildren: ['stack', 'list_box'],
}, class History extends Adw.Bin {
  constructor() {
    super()
    this._list = [];
    this.load_list();
    const load = new Gio.SimpleAction({ name: 'load' });
    const action_group = new Gio.SimpleActionGroup();
    action_group.insert(load);
  }
  load_list() {
    data.subscribe((value) => {
      if (value.length === 0)
        return this._stack.visible_child_name = "no_history";

      this._stack.visible_child_name = "history";
      if (this._list.length === 0) {
        value.forEach((item, index) => {
          const row = new HistoryRow(this, item, index);
          this._list_box.append(row);
          this._list.push({
            title: item.title,
            row: row,
          })
        });
        return
      }
      const remove_items = this._list.filter(element => value.findIndex(array_item => array_item.id === element.row.item.id) < 0);
      value.forEach((item, index) => {
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
    })
  }
  navigate() {
    activate_action('navigation', new GLib.Variant('s', 'timer'), 1);
  }
})
