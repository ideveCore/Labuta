import GObject from 'gi://GObject';
import Adw from 'gi://Adw';
import GLib from 'gi://GLib';
import { data } from './stores.js';

export const Statistics = GObject.registerClass({
  GTypeName: "Statistics",
  Template: 'resource:///io/gitlab/idevecore/Pomodoro/ui/statistics.ui',
  InternalChildren: [
    'work_timer_today',
    'work_timer_today_label',
    'work_timer_week',
    'work_timer_week_label',
    'work_timer_month',
    'work_timer_month_label',
    'break_timer_today_label',
    'break_timer_week_label',
    'break_timer_month_label'
  ],
}, class Statistics extends Adw.Bin {
  constructor() {
    super()
    this._current_date = GLib.DateTime.new_now_local();
    this.load_data()
  }
  load_data() {
    this.load_work_timer()
    this.load_break_timer()
  }
  get_day() {
    return this._current_date.get_day_of_year();
  }
  get_week() {
    return this._current_date.get_week_of_year();
  }
  get_month() {
    return this._current_date.get_month() + 1;
  }
  load_work_timer() {
    data.subscribe((value) => {
      const today = value.filter((item) => item.date.day === this.get_day())
      const yesterday = value.filter((item) => item.date.day === this.get_day() - 1);
      const week = value.filter((item) => item.date.week === this.get_week());
      const last_week = value.filter((item) => item.date.week === this.get_week() - 1);
      const month = value.filter((item) => item.date.month === this.get_month() - 1);
      const last_month = value.filter((item) => item.date.month === this.get_month() - 2);

      const work_timer_today = today.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
      const work_timer_yesterday = yesterday.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
      const work_timer_week = week.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
      const work_timer_last_week = last_week.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
      const work_timer_month = month.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);
      const work_timer_last_month = last_month.reduce((accumulator, current_value) => accumulator + current_value.work_time, 0);

      const percentage_work_timer_today_yesterday = () => {
        let value = ((work_timer_today - work_timer_yesterday) / work_timer_yesterday) * 100;
        value = value ? value : 0
        value = value === Infinity ? 100 : value;
        let adjective = _('more');
        if (value < 0)
          adjective = _('less');
        return `${Math.abs(value).toFixed(0)}% ${adjective} ${_("than yesterday")}`
      }
      const percentage_work_timer_week_last_week = () => {
        let value = ((work_timer_week - work_timer_last_week) / work_timer_last_week) * 100;
        value = value ? value : 0
        value = value === Infinity ? 100 : value;

        let adjective = _('more');
        if (value < 0)
          adjective = _('less');
        return `${Math.abs(value).toFixed(0)}% ${adjective} ${_("than last week")}`
      }
      const percentage_work_timer_month_last_month = () => {
        let value = ((work_timer_month - work_timer_last_month) / work_timer_last_month) * 100;
        value = value ? value : 0
        value = value === Infinity ? 100 : value;
        let adjective = _('more');
        if (value < 0)
          adjective = _('less');
        return `${Math.abs(value).toFixed(0)}% ${adjective} ${_("than last month")}`
      }
      this._work_timer_today_label.set_text(this.format_timer(work_timer_today))
      this._work_timer_today.set_subtitle(percentage_work_timer_today_yesterday())
      this._work_timer_week_label.set_text(this.format_timer(work_timer_week))
      this._work_timer_week.set_subtitle(percentage_work_timer_week_last_week())
      this._work_timer_month_label.set_text(this.format_timer(work_timer_month))
      this._work_timer_month.set_subtitle(percentage_work_timer_month_last_month())
    })
  }
  load_break_timer() {
    data.subscribe((value) => {
      const today = value.filter((item) => item.date.day === this.get_day())
      const week = value.filter((item) => item.date.week === this.get_week());
      const month = value.filter((item) => item.date.month === this.get_month());

      const break_timer_today = today.reduce((accumulator, current_value) => accumulator + current_value.break_time, 0);
      const break_timer_week = week.reduce((accumulator, current_value) => accumulator + current_value.break_time, 0);
      const break_timer_month = month.reduce((accumulator, current_value) => accumulator + current_value.break_time, 0);

      this._break_timer_today_label.set_text(this.format_timer(break_timer_today))
      this._break_timer_week_label.set_text(this.format_timer(break_timer_week))
      this._break_timer_month_label.set_text(this.format_timer(break_timer_month))
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
})
