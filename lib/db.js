import { createClient } from '@libsql/client';

// Lazy singleton - created on first use, not at import time
let _client = null;

function getClient() {
  if (_client) return _client;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error(
      'Missing Turso credentials. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel environment variables.'
    );
  }

  _client = createClient({ url, authToken });
  return _client;
}

// Proxy object so callers use `client.execute()` same as before
const client = {
  execute: (...args) => getClient().execute(...args),
  batch:   (...args) => getClient().batch(...args),
};

export default client;
