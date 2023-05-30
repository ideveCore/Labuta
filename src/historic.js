import GObject from 'gi://GObject';
import Adw from 'gi://Adw';
import { HistoricRow } from './historic_row.js';
import { data, navigation } from './stores.js';

export const Historic = GObject.registerClass({
  GTypeName: "Historic",
  Template: 'resource:///com/gitlab/idevecore/Pomodoro/ui/historic.ui',
  InternalChildren: ['stack', 'list_box'],
}, class Historic extends Adw.Bin {
  constructor() {
    super()
    data.$((value) => {
      this.load_list();
    })
    this._list = [];
    this.load_list();
  }
  load_list() {
    data.subscribe((value) => {
      if (value.length === 0)
        return this._stack.visible_child_name = "no_historic";

      this._stack.visible_child_name = "historic";
      if (this._list.length === 0) {
        value.forEach((item, index) => {
          const row = new HistoricRow(item, index);
          this._list_box.append(row);
          this._list.push({
            title: item.title,
            row: row,
          })
        });
        return
      }
      const remove_items = this._list.filter(element => value.findIndex(array_item => array_item.title === element.title) < 0);
      value.forEach((item, index) => {
        const finded = this._list.find(array_item => array_item.title === item.title);
        if (finded)
          return
        const row = new HistoricRow(item, index);
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
    navigation.update(() => 'timer')
  }
})
