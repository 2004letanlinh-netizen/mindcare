const { Router } = require('express');
const { createSupabaseClient } = require('../config/supabase');
const requireAuth = require('../middleware/require-auth');

const router = Router();

router.post('/signup', async (request, response, next) => {
  try {
    const { email, password, displayName } = request.body;
    if (!email || !password || password.length < 8) {
      return response.status(400).json({ error: 'Email and a password of at least 8 characters are required.' });
    }
    const supabase = createSupabaseClient();
    if (!supabase) return response.status(503).json({ error: 'Supabase is not configured yet.' });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: String(displayName || '').slice(0, 40) } }
    });
    if (error) return response.status(400).json({ error: error.message });
    return response.status(201).json({ user: data.user, session: data.session });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (request, response, next) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) return response.status(400).json({ error: 'Email and password are required.' });
    const supabase = createSupabaseClient();
    if (!supabase) return response.status(503).json({ error: 'Supabase is not configured yet.' });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return response.status(401).json({ error: error.message });
    return response.json({ user: data.user, session: data.session });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuth, async (request, response, next) => {
  try {
    const { data, error } = await request.supabase
      .from('profiles')
      .select('display_name, reputation')
      .eq('id', request.user.id)
      .single();
    if (error) return next(error);
    return response.json({ user: { id: request.user.id, email: request.user.email }, profile: data });
  } catch (error) {
    return next(error);
  }
});

router.patch('/me', requireAuth, async (request, response, next) => {
  try {
    const displayName = typeof request.body.displayName === 'string' ? request.body.displayName.trim() : '';
    if (displayName.length < 1 || displayName.length > 40) {
      return response.status(400).json({ error: 'Display name must be between 1 and 40 characters.' });
    }
    const { data, error } = await request.supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', request.user.id)
      .select('display_name, reputation')
      .single();
    if (error) return next(error);
    return response.json({ profile: data });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
