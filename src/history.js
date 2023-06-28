import GObject from 'gi://GObject';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import { HistoryRow } from './history_row.js';
import { data, settings } from './stores.js';
import { activate_action, Application_data, capitalize } from './utils.js';


export const History = GObject.registerClass({
  GTypeName: "History",
  Template: 'resource:///io/gitlab/idevecore/Pomodoro/ui/history.ui',
  InternalChildren: [
    'stack',
    'list_box',
    'total_work_time',
    'total_break_time',
    'delete_button',
    'sorting_button_content',
  ],
}, class History extends Adw.Bin {
  constructor() {
    super()
    this._list = [];
    this.sort_by = settings.get_string('sort-by');
    this.order_by = settings.get_string('order-by');
    const load = new Gio.SimpleAction({ name: 'load' });
    const action_group = new Gio.SimpleActionGroup();
    action_group.insert(load);
    this.activated_selection = false;
    const sort_action_group = new Gio.SimpleActionGroup();
    this.insert_action_group('sort', sort_action_group);
    const sort_action = new Gio.SimpleAction({ name: 'sort', parameter_type: new GLib.VariantType('s') });
    const order_action = new Gio.SimpleAction({ name: 'order', parameter_type: new GLib.VariantType('s') });
    sort_action_group.add_action(sort_action);
    sort_action_group.add_action(order_action);

    const load_sorting_button_content = () => {
      this._sorting_button_content.set_label(capitalize(this.sort_by));
      this._sorting_button_content.set_icon_name(this.order_by === 'ascending' ? 'view-sort-ascending-symbolic' : 'view-sort-descending-symbolic');
    }

    load_sorting_button_content()

    sort_action.connect('activate', (action, parameter) => {
      data.subscribe((value) => {
        let items = []
        value.forEach((item, index) => {
          items.push(this._list_box.get_row_at_index(index))
        })
        items.forEach((item) => {
          this._list_box.remove(item)
        })
      })
      let sort_by = parameter.deep_unpack();
      settings.set_string('sort-by', sort_by);
      this.sort_by = settings.get_string('sort-by');
      load_sorting_button_content()
      this._list = []
      this.load_list()

    })

    order_action.connect('activate', (action, parameter) => {
      data.subscribe((value) => {
        let items = []
        value.forEach((item, index) => {
          items.push(this._list_box.get_row_at_index(index))
        })
        items.forEach((item) => {
          this._list_box.remove(item)
        })
      })
      let sort_by = parameter.deep_unpack();
      settings.set_string('order-by', sort_by);
      this.order_by = settings.get_string('order-by');
      load_sorting_button_content()
      this._list = []
      this.load_list()
    })
    this.load_list();
  }
  load_list() {
    data.subscribe((value) => {
      if (this.sort_by === 'name') {
        value = value.sort((a, b) => a.title.localeCompare(b.title))
      } else if (this.sort_by === 'date') {
        value = value.sort((a, b) => a.date.day - b.date.day);
      }

      if (this.order_by === 'descending') {
        value = value.slice(0).reverse()
      }
      this.load_time(value)
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
  active_selection() {
    this.activated_selection = !this.activated_selection;
    this._list.forEach((item) => {
      item.row.toggle_active_selection()
    });
    if (!this.activated_selection) {
      data.subscribe((value) => {
        this.load_time(value)
      })
      this._delete_button.set_visible(false)
    } else {
      this.load_time([])
      this._delete_button.set_visible(true)
    }
  }
  load_time(time) {
    const total_work_timer = time.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
    const total_break_timer = time.reduce((accumulator, current_value) => accumulator + current_value.break_time, 0);
    this._total_work_time.set_text(`Total work: ${this.format_timer(total_work_timer)}`)
    this._total_break_time.set_text(`Total break: ${this.format_timer(total_break_timer)}`)
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
  on_selected() {
    const selecteds = this._list.filter((item) => item.row.selected === true)
    let value = [];
    selecteds.forEach((item) => {
      value.push(item.row.item)
    })
    this.load_time(value)
    if (value.length > 0) {
      this._delete_button.set_icon_name('user-trash-full-symbolic')
      this._delete_button.set_sensitive(true)
    } else {
      this._delete_button.set_icon_name('user-trash-symbolic')
      this._delete_button.set_sensitive(false)
    }
  }
  on_delete() {
    const selecteds = this._list.filter((item) => item.row.selected === true);
    data.subscribe((value) => {
      const new_data = value.filter((item) => !(selecteds.find((selected_item) => selected_item.row.item === item) ? true : false));
      data.update(() => new_data);
      new Application_data().save();
      this.load_list();
      this._delete_button.set_sensitive(false)
      this._delete_button.set_icon_name('user-trash-symbolic');
      this.active_selection();
    })
  }
})
