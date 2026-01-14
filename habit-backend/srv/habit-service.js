const cds = require('@sap/cds');
const { message } = require('@sap/cds/lib/log/cds-error');
const { INSERT, SELECT } = require('@sap/cds/lib/ql/cds-ql');

module.exports = cds.service.impl(function () {

  const { Habits, HabitLogs } = this.entities;

  const db =  cds.connect.to('db');


  this.on('POST', '/',  req => {
    const { name, descr } = req.data;

    if (!name) req.reject(400, 'name is required');

     db.run(
      INSERT.into(Habits).entries({ name, descr })
    );

    return { message: 'Habit created' };
  })


  this.on('GET', '/' , req => {
   // return db.run( SELECT.from(Habits))
   return db.run(`SELECT * FROM habit_Habits`)
  })





// Update 1
this.on('PATCH', 'Habits', async req => {
  const ID = req.data.ID;
  const name = req.data.name;
  const descr = req.data.descr;

  if (!ID) {
    req.reject(400, 'ID is required');
  }

  await UPDATE(Habits)
    .set({
      name: name,
      descr: descr
    })
    .where({ ID: ID });

  return { message: 'Habit updated successfully' };
});





// delete
this.on('DELETE', 'Habits', async req => {
  const { ID } = req.data;

  if (!ID) req.reject(400, 'ID required');

  await DELETE.from(Habits).where({ ID });

  return { message: 'Habit deleted' };
});


  this.on('markDone', req => markHabit(req, 'DONE'));
  this.on('markMissed', req => markHabit(req, 'MISSED'));

  async function markHabit(req, status) {
    const { habitId } = req.data;
    if (!habitId) req.reject(400, 'habitId is required');

    const habit = await SELECT.one.from(Habits).where({ ID: habitId });
    if (!habit) req.reject(404, 'Habit not found');

    const today = new Date().toISOString().slice(0, 10);

    const exists = await SELECT.one.from(HabitLogs)
      .where({ habit_ID: habitId, logDate: today });

    if (exists) req.reject(409, 'Habit already logged today');

    await INSERT.into(HabitLogs).entries({
      habit_ID: habitId,
      logDate: today,
      status
    });

    return { status };
  }

  this.on('completionRate', async req => {
    const logs = await SELECT.from(HabitLogs)
      .where({ habit_ID: req.data.habitId });

    const done = logs.filter(l => l.status === 'DONE').length;
    return logs.length ? Math.round(done * 100 / logs.length) : 0;
  });


});
