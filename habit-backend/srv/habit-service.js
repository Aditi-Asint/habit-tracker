const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
  const { Users, Habits, HabitLogs } = this.entities;

  /**
   * 1️⃣ First-login user creation
   * Runs once per request; inserts profile if missing
   */
  this.before('*', async (req) => {
    if (!req.user || !req.user.id) return;

    const exists = await SELECT.one
      .from(Users)
      .where({ userId: req.user.id });

    if (!exists) {
      await INSERT.into(Users).entries({
        userId: req.user.id,
        email: req.user.id
      });
    }
  });

  /**
   * 2️⃣ Action: Mark habit as DONE today
   */
  this.on('markDone', async (req) => {
    return markHabit(req, 'DONE');
  });

  /**
   * 3️⃣ Action: Mark habit as MISSED today
   */
  this.on('markMissed', async (req) => {
    return markHabit(req, 'MISSED');
  });

  /**
   * 4️⃣ Function: Completion rate
   */
  // this.on('completionRate', async (req) => {
  //   const { habitId } = req.data;

  //   const total = await SELECT.from(HabitLogs)
  //     .where({ habit_ID: habitId });

  //   if (total.length === 0) return 0;

  //   const doneCount = total.filter(l => l.status === 'DONE').length;
  //   return Math.round((doneCount / total.length) * 100);
  // });

  this.after('READ', 'Habits', async (rows) => {
  const habits = Array.isArray(rows) ? rows : [rows];

  for (const h of habits) {
    const logs = await SELECT.from(HabitLogs).where({ habit_ID: h.ID });
    if (!logs.length) {
      h.completionRate = 0;
    } else {
      const done = logs.filter(l => l.status === 'DONE').length;
      h.completionRate = Math.round((done / logs.length) * 100);
    }
  }
});


  /**
   * Helper: shared logic for markDone / markMissed
   */
  async function markHabit(req, status) {
    const { habitId } = req.data;
    const today = new Date().toISOString().slice(0, 10);

    // Ensure habit exists and belongs to user
    const habit = await SELECT.one.from(Habits).where({
      ID: habitId,
      owner: req.user.id
    });

    if (!habit) {
      return req.reject(404, 'Habit not found or not owned by user');
    }

    // Prevent duplicate log for today
    const exists = await SELECT.one.from(HabitLogs).where({
      habit_ID: habitId,
      logDate: today
    });

    if (exists) {
      return req.reject(409, 'Habit already logged for today');
    }

    // Create log
    await INSERT.into(HabitLogs).entries({
      habit_ID: habitId,
      logDate: today,
      status
    });

    return { message: `Habit marked as ${status}` };
  }
});
