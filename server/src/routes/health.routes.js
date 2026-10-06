const { Router } = require('express');
const { isSupabaseConfigured } = require('../config/supabase');

const router = Router();

router.get('/', (_request, response) => {
  response.json({
    status: 'ok',
    service: 'mindcare-api',
    supabaseConfigured: isSupabaseConfigured()
  });
});

module.exports = router;
