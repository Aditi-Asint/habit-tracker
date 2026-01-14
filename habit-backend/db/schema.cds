using { cuid } from '@sap/cds/common';

namespace habit;

entity Users : cuid {
  key userId : String @assert.format: 'email';
}

entity Habits : cuid {
  name     : String not null;
  descr    : String;
  isActive : Boolean default true;

  logs     : Composition of many HabitLogs
             on logs.habit = $self;

  completionRate : Integer @cds.virtual;
}

entity HabitLogs : cuid {
  habit   : Association to Habits;
  logDate : Date;
  status  : String;
}
