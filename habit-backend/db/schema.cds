using { cuid, managed } from '@sap/cds/common';

namespace habit;

define entity Users : cuid, managed {
  userId : String;        // it comes from cds.user.id
  email  : String;       // use @email here
  habits : Composition of many Habits
             on habits.owner = userId;
  HabitStats : Integer;

  // if want to like if email end with "@gmail.com" >>> then "App-User" and "@asint.net" >>> then "Admin"
}


entity Habits : cuid, managed {
  name     : String not null;
  descr    : type of name;
  isActive : Boolean default true;
  owner    : String;      // cds.user.id
  logs     : Composition of many HabitLogs on logs.habit = $self;
  completionRate : Integer @cds.virtual;
//i can give habit type as well
}


entity HabitLogs : cuid, managed {
  habit   : Association to Habits;
  logDate : Date;
  status  : String;       // DONE / MISSED
}
