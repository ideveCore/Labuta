import GLib from 'gi://GLib';
import Gda from 'gi://Gda';
import Gio from 'gi://Gio';

// const data_dir = GLib.get_user_config_dir();
// const connection = new Gda.Connection({
//   provider: Gda.Config.get_provider('SQLite'),
//   cnc_string: `DB_DIR=${data_dir};DB_NAME=pomodoro`,
// });

// connection.open();

// console.log(connection);


export default class Database {
  constructor() {
    this.database_dir = GLib.get_user_config_dir();
    this.connection = null;
  }
  init() {
    this.connection = new Gda.Connection({
      provider: Gda.Config.get_provider('SQLite'),
      cnc_string: `DB_DIR=${this.database_dir};DB_NAME=pomodoro`,
    })
    this.connection.open();
  }
  setup() {
    this.init();
    if (!this.connection || !this.connection.is_opened()) {
      debug('connection is not opened');
      return;
    }

    this.connection.execute_non_select_command(`
      create table if not exists history
      (
          id          integer not null constraint clipboard_pk primary key autoincrement,
          title       text not null,
          description text not null,
          workTime    integer not null,
          breakTime   integer not null
      );
    `);

    this.connection.execute_non_select_command(`
      create unique index if not exists clipboard_id_uindex on clipboard (id);
    `);
  }
  save(dbItem) {
    if (!this.connection || !this.connection.is_opened()) {
      console.log('connection is not opened');
      return null;
    }

    const builder = new Gda.SqlBuilder({
      stmt_type: Gda.SqlStatementType.INSERT,
    });

    builder.set_table('history');
    builder.add_field_value_as_gvalue('title', dbItem.title);
    builder.add_field_value_as_gvalue('description', dbItem.description);
    builder.add_field_value_as_gvalue('workTime', dbItem.workTime);
    builder.add_field_value_as_gvalue('breakTime', +dbItem.breakTime);
    const [_, row] = this.connection.statement_execute_non_select(builder.get_statement(), null);
    const id = row.get_nth_holder(0).get_value();
    if (!id) {
      return null;
    }
    return {
      id,
      title: dbItem.title,
      description: dbItem.description,
      workTime: dbItem.workTime,
      breakTime: dbItem.breakTime,
    };
  }
  query(clipboardQuery) {
    if (!this.connection || !this.connection.is_opened()) {
      return [];
    }

    const dm = this.connection.statement_execute_select(clipboardQuery.statement, null);

    const iter = dm.create_iter();
    const itemList = [];

    while (iter.move_next()) {
      const id = iter.get_value_for_field('id');
      const itemType = iter.get_value_for_field('title');
      const content = iter.get_value_for_field('description');
      const copyDate = iter.get_value_for_field('workTime');
      const isFavorite = iter.get_value_for_field('breakTime');

      itemList.push({
        id,
        itemType,
        content,
        copyDate: new Date(copyDate),
        isFavorite: !!isFavorite,
      });
    }

    return itemList;
  }
}


