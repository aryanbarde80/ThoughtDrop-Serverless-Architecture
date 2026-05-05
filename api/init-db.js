import client from '../lib/db.js';

export default async function handler(req, res) {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT UNIQUE,
        type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    if (res && typeof res.status === 'function') {
      return res.status(200).json({ message: 'Database initialized successfully' });
    } else {
      console.log('Database initialized successfully');
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    if (res && typeof res.status === 'function') {
      return res.status(500).json({ error: 'Database initialization failed', details: error.message });
    }
  }
}

// Allow running directly via node
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  handler().then(() => process.exit(0)).catch(() => process.exit(1));
}
