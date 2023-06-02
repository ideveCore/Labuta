import GObject from 'gi://GObject';
import Adw from 'gi://Adw';
import { Application, data } from './stores.js';
import { Application_data } from './utils.js';

export const HistoricRow = GObject.registerClass({
  GTypeName: "HistoricRow",
  Template: 'resource:///io/gitlab/idevecore/Pomodoro/ui/historic_row.ui',
  InternalChildren: ['work_time', 'break_time', 'description', 'counts'],
}, class HistoricRow extends Adw.ExpanderRow {
  constructor(item, index) {
    super();
    this.item = item;
    this.index = index;
    this.set_title(this.item.title.toString());
    this.set_subtitle(this.item.date.display_date.toString());
    this._work_time.set_text(this.format_timer(this.item.work_time).toString());
    this._break_time.set_text(this.format_timer(this.item.break_time).toString());
    this._description.set_subtitle(this.item.description.toString());
    this._counts.set_text(this.item.counts.toString());
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
  }
})
