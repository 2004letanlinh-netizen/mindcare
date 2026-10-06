const { Router } = require('express');
const requireAuth = require('../middleware/require-auth');

const router = Router();

router.use(requireAuth);

router.get('/', async (request, response, next) => {
  try {
    const { data, error } = await request.supabase
      .from('check_ins')
      .select('id, check_in_date, mood_score, sleep_hours, sleep_quality, note, created_at')
      .order('check_in_date', { ascending: false })
      .limit(30);
    if (error) return next(error);
    return response.json({ checkIns: data });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (request, response, next) => {
  try {
    const { moodScore, sleepHours, sleepQuality, note } = request.body;
    if (!Number.isInteger(moodScore) || moodScore < 1 || moodScore > 5) {
      return response.status(400).json({ error: 'moodScore must be an integer from 1 to 5.' });
    }
    if (sleepHours !== undefined && (typeof sleepHours !== 'number' || sleepHours < 0 || sleepHours > 24)) {
      return response.status(400).json({ error: 'sleepHours must be between 0 and 24.' });
    }
    if (sleepQuality !== undefined && (!Number.isInteger(sleepQuality) || sleepQuality < 1 || sleepQuality > 5)) {
      return response.status(400).json({ error: 'sleepQuality must be an integer from 1 to 5.' });
    }

    const { data, error } = await request.supabase
      .from('check_ins')
      .upsert({
        user_id: request.user.id,
        check_in_date: new Date().toISOString().slice(0, 10),
        mood_score: moodScore,
        sleep_hours: sleepHours ?? null,
        sleep_quality: sleepQuality ?? null,
        note: typeof note === 'string' ? note.slice(0, 500) : null
      }, { onConflict: 'user_id,check_in_date' })
      .select('id, check_in_date, mood_score, sleep_hours, sleep_quality, note')
      .single();
    if (error) return next(error);
    return response.status(201).json({ checkIn: data });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
