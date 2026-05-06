import client from '../lib/db.js';
import { generateThought } from '../lib/ai.js';
import { sendEmail } from '../lib/email.js';
import { getRandomFallback } from '../lib/fallbacks.js';

export default async function handler(req, res) {
  // 1. Security: cron-only unless test=true or development
  const isCron = req.headers['x-vercel-cron'] === '1';
  const isDev = process.env.NODE_ENV === 'development';
  const isTest = req.query.test === 'true';

  if (!isCron && !isDev && !isTest) {
    return res.status(403).json({ success: false, error: 'Access denied. Cron only.' });
  }

  const { type } = req.query;
  if (!type || (type !== 'morning' && type !== 'evening')) {
    return res.status(400).json({ success: false, error: 'Invalid type. Must be "morning" or "evening".' });
  }

  try {
    // 2. Auto-init DB if tables don't exist yet
    try {
      await client.execute(`CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT UNIQUE,
        type TEXT,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      await client.execute(`CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        streak INTEGER DEFAULT 0,
        last_sent_date DATE,
        total_sent INTEGER DEFAULT 0
      )`);
      await client.execute(`INSERT OR IGNORE INTO stats (id, streak, total_sent) VALUES (1, 0, 0)`);
    } catch (initErr) {
      console.error('DB init error:', initErr.message);
      return res.status(500).json({
        success: false,
        error: 'Database error: ' + initErr.message,
        hint: 'Check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel env vars'
      });
    }

    // 3. Fetch last 20 quotes to avoid repeats
    let previousQuotes = [];
    try {
      const result = await client.execute({ sql: 'SELECT text FROM quotes ORDER BY created_at DESC LIMIT 20', args: [] });
      previousQuotes = result.rows.map(r => r.text);
    } catch (e) {
      console.warn('Could not fetch previous quotes:', e.message);
    }

    // 4. Generate thought (3 attempts, then fallback)
    let thought = null;
    let category = 'fallback';

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const data = await generateThought(type, previousQuotes);
        const candidate = data.thought;
        const dupeCheck = await client.execute({ sql: 'SELECT id FROM quotes WHERE text = ?', args: [candidate] });
        if (dupeCheck.rows.length === 0) {
          thought = candidate;
          category = data.category;
          console.log('AI thought generated on attempt', attempt);
          break;
        }
        console.log('Attempt', attempt, 'duplicate, retrying...');
      } catch (e) {
        console.error('AI attempt', attempt, 'failed:', e.message);
      }
    }

    if (!thought) {
      console.log('Using fallback quote');
      thought = getRandomFallback(type);
      category = 'fallback';
    }

    // 5. Personalize
    const userName = process.env.USER_NAME || 'Aryan';
    const personalizedThought = type === 'morning'
      ? 'Good Morning ' + userName + ' 🌅\n\n' + thought
      : 'Hope your evening is peaceful ' + userName + ' 🌙\n\n' + thought;

    // 6. Update streak
    const today = new Date().toISOString().split('T')[0];
    const statsResult = await client.execute('SELECT * FROM stats WHERE id = 1');
    const stats = statsResult.rows[0];

    let newStreak = stats ? (stats.streak || 0) : 0;
    const lastDate = stats ? stats.last_sent_date : null;

    if (!lastDate) {
      newStreak = 1;
    } else {
      const diffDays = Math.floor((new Date(today) - new Date(lastDate)) / 86400000);
      if (diffDays === 0) {
        // Same day — no streak change
      } else if (diffDays === 1) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    // 7. Save quote + update stats
    await client.batch([
      { sql: 'INSERT OR IGNORE INTO quotes (text, type, category) VALUES (?, ?, ?)', args: [thought, type, category] },
      { sql: 'UPDATE stats SET streak = ?, last_sent_date = ?, total_sent = total_sent + 1 WHERE id = 1', args: [newStreak, today] }
    ], 'write');

    // 8. Send email (fail-safe)
    let emailSent = false;
    try {
      await sendEmail(type, personalizedThought);
      emailSent = true;
    } catch (e) {
      console.error('Email failed (quote still saved):', e.message);
    }

    return res.status(200).json({
      success: true,
      streak: newStreak,
      category,
      email_sent: emailSent,
      thought: personalizedThought,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Critical error:', error.message || error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
