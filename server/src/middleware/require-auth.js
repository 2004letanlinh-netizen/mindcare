const { createSupabaseClient } = require('../config/supabase');

async function requireAuth(request, response, next) {
  const accessToken = request.get('authorization')?.replace(/^Bearer\s+/i, '');
  const supabase = createSupabaseClient();

  if (!supabase) {
    return response.status(503).json({ error: 'Supabase is not configured yet.' });
  }
  if (!accessToken) {
    return response.status(401).json({ error: 'Sign in is required.' });
  }

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    return response.status(401).json({ error: 'Session is invalid or expired.' });
  }

  request.user = data.user;
  request.supabase = createSupabaseClient(accessToken);
  return next();
}

module.exports = requireAuth;
