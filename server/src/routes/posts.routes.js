const { Router } = require('express');
const { createSupabaseClient } = require('../config/supabase');
const requireAuth = require('../middleware/require-auth');

const router = Router();

router.get('/', async (_request, response, next) => {
  try {
    const supabase = createSupabaseClient();
    if (!supabase) return response.status(503).json({ error: 'Supabase is not configured yet.' });
    const { data, error } = await supabase
      .from('posts')
      .select('id, topic, content, is_anonymous, created_at, profiles(display_name)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) return next(error);
    return response.json({ posts: data });
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireAuth, async (request, response, next) => {
  try {
    const { content, topic, isAnonymous = true } = request.body;
    if (typeof content !== 'string' || content.trim().length < 3 || content.length > 3000) {
      return response.status(400).json({ error: 'Post content must be between 3 and 3000 characters.' });
    }
    if (typeof topic !== 'string' || topic.length > 40) {
      return response.status(400).json({ error: 'A valid topic is required.' });
    }
    const { data, error } = await request.supabase
      .from('posts')
      .insert({
        content: content.trim(),
        topic,
        is_anonymous: Boolean(isAnonymous),
        author_user_id: isAnonymous ? null : request.user.id,
        status: 'pending'
      })
      .select('id, topic, content, is_anonymous, created_at, status')
      .single();
    if (error) return next(error);
    return response.status(201).json({ post: data });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
