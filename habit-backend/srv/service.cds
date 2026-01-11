using habit from '../db/schema';

service HabitService {

  /**
   * User-facing Habits
   * Users can only see and modify their own data
   */
  @restrict: [
    { grant: 'READ', where: 'owner = $user' },
    { grant: ['CREATE', 'UPDATE', 'DELETE'], where: 'owner = $user' }
  ]
  entity Habits as projection on habit.Habits;

  /**
   * Logs are accessed via Habits ($expand)
   */
  entity HabitLogs as projection on habit.HabitLogs;

  /**
   * Business actions (implemented in Phase 3)
   */
  action markDone(habitId : UUID);
  action markMissed(habitId : UUID);

  // /**
  //  * Read-only calculated data
  //  */
  // function completionRate(habitId : UUID) returns Integer;
}


/**
 * Admin-only service (App Owner view)
 */

entity HabitStats as select from habit.Habits{
  owner, count(*) as totalHabits
}
group by owner;   // for analytical purpose

service AdminService {

  @requires: 'Admin'
  entity Users  as projection on habit.Users;

  @requires: 'Admin'
  entity Habits as projection on habit.Habits;   // what if i use as selected from

  @requires: 'Admin'
  entity HabitStats as projection on HabitStats;

}

