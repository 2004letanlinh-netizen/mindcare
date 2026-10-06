const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');

delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_ANON_KEY;
const app = require('../server/src/app');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

test('health endpoint reports API and Supabase setup state', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: 'ok',
    service: 'mindcare-api',
    supabaseConfigured: false
  });
});

test('serves the MindCare frontend at the root path', async () => {
  const response = await fetch(`${baseUrl}/`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /MindCare \| Chăm sóc tinh thần/);
});

test('Supabase-backed routes fail clearly when configuration is missing', async () => {
  const posts = await fetch(`${baseUrl}/api/posts`);
  assert.equal(posts.status, 503);
  assert.match((await posts.json()).error, /Supabase is not configured/);

  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'member@example.com', password: 'long-enough-password' })
  });
  assert.equal(login.status, 503);
});
