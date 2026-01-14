using habit from '../db/schema';

service HabitService {

  @restrict: [
    { grant: ['READ', 'CREATE', 'UPDATE', 'DELETE'], to: 'USER' }
  ]
  entity Habits as projection on habit.Habits;
  entity HabitLogs as projection on habit.HabitLogs;

  action markDone(habitId : UUID);
  action markMissed(habitId : UUID);

  function completionRate(habitId : UUID) returns Integer;
}

service AdminService {

  @requires: 'ADMIN'
  entity Users  as projection on habit.Users;

  @requires: 'ADMIN'
  entity Habits as projection on habit.Habits;
}

service CustomHabitService @(path:'/rest/habits') {
   entity Habits as projection on habit.Habits;
}
