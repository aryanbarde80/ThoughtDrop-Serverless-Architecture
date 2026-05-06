import client from '../lib/db.js';

export default async function handler(req, res) {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT UNIQUE,
        type TEXT,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        streak INTEGER DEFAULT 0,
        last_sent_date DATE,
        total_sent INTEGER DEFAULT 0
      )
    `);

    // Initialize stats row if not exists
    await client.execute(`
      INSERT OR IGNORE INTO stats (id, streak, total_sent) VALUES (1, 0, 0)
    `);

    console.log('✅ Database initialized successfully');

    return res.status(200).json({ 
      success: true,
      message: 'Database initialized successfully. Tables: quotes, stats.' 
    });
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Database initialization failed', 
      details: error.message 
    });
  }
}
