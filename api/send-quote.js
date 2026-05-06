import client from '../lib/db.js';
import { generateThought } from '../lib/ai.js';
import { sendEmail } from '../lib/email.js';
import { getRandomFallback } from '../lib/fallbacks.js';

export default async function handler(req, res) {
  // 1. Security: Cron-only access guard (allow manual test via query param)
  const isCron = req.headers['x-vercel-cron'] === '1';
  const isDev = process.env.NODE_ENV === 'development';
  const isManualTest = req.query.test === 'true';

  if (!isCron && !isDev && !isManualTest) {
    return res.status(403).json({ error: 'Access denied. Cron only.' });
  }

  const { type } = req.query;
  if (!type || (type !== 'morning' && type !== 'evening')) {
    return res.status(400).json({ error: 'Invalid type. Must be "morning" or "evening".' });
  }

  try {
    // 2. Fetch last 20 quotes for dedup context
    let previousQuotes = [];
    try {
      const lastQuotesResult = await client.execute({
        sql: 'SELECT text FROM quotes ORDER BY created_at DESC LIMIT 20',
        args: [],
      });
      previousQuotes = lastQuotesResult.rows.map(row => row.text);
    } catch (dbError) {
      console.warn('⚠️ Could not fetch previous quotes:', dbError.message);
    }

    // 3. Generate thought with retry + dedup logic
    let thought = null;
    let category = 'fallback';
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const thoughtData = await generateThought(type, previousQuotes);
        const candidate = thoughtData.thought;

        // Check for duplicates
        const checkResult = await client.execute({
          sql: 'SELECT id FROM quotes WHERE text = ?',
          args: [candidate],
        });

        if (checkResult.rows.length === 0) {
          thought = candidate;
          category = thoughtData.category;
          console.log(`✅ AI thought generated on attempt ${attempt}`);
          break;
        } else {
          console.log(`Attempt ${attempt}: Duplicate detected, retrying...`);
        }
      } catch (aiError) {
        console.error(`❌ AI Attempt ${attempt} failed:`, aiError.message);
      }
    }

    // 4. Fallback if AI failed or all were duplicates
    if (!thought) {
      console.log('⚠️ Using fallback quote...');
      thought = getRandomFallback(type);
      category = 'fallback';
    }

    // 5. Personalization
    const userName = process.env.USER_NAME || 'Aryan';
    const personalizedThought =
      type === 'morning'
        ? `Good Morning ${userName} 🌅\n\n${thought}`
        : `Hope your evening is peaceful ${userName} 🌙\n\n${thought}`;

    // 6. Update streak
    const today = new Date().toISOString().split('T')[0];

    let statsRow;
    try {
      const statsResult = await client.execute('SELECT * FROM stats WHERE id = 1');
      statsRow = statsResult.rows[0];
    } catch (e) {
      console.error('❌ Failed to read stats:', e.message);
    }

    if (!statsRow) {
      // Auto-init DB if not done yet
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
        const statsResult = await client.execute('SELECT * FROM stats WHERE id = 1');
        statsRow = statsResult.rows[0];
        console.log('✅ Auto-initialized database');
      } catch (initError) {
        console.error('❌ Failed to auto-init DB:', initError.message);
        return res.status(500).json({ error: 'Database not initialized. Visit /api/init-db first.' });
      }
    }

    let newStreak = statsRow.streak || 0;
    const lastDate = statsRow.last_sent_date;

    if (!lastDate) {
      newStreak = 1;
    } else {
      const last = new Date(lastDate);
      const current = new Date(today);
      const diffDays = Math.floor((current - last) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day: keep streak (already sent today)
        // Still proceed to save and send
      } else if (diffDays === 1) {
        newStreak += 1;
      } else {
        newStreak = 1; // Reset
      }
    }

    // 7. Save quote + update stats in a batch
    await client.batch(
      [
        {
          sql: 'INSERT OR IGNORE INTO quotes (text, type, category) VALUES (?, ?, ?)',
          args: [thought, type, category],
        },
        {
          sql: 'UPDATE stats SET streak = ?, last_sent_date = ?, total_sent = total_sent + 1 WHERE id = 1',
          args: [newStreak, today],
        },
      ],
      'write'
    );

    // 8. Send email (non-blocking failure)
    let emailSent = false;
    try {
      await sendEmail(type, personalizedThought);
      emailSent = true;
    } catch (emailError) {
      console.error('⚠️ Email delivery failed (quote still saved):', emailError.message);
    }

    return res.status(200).json({
      success: true,
      streak: newStreak,
      category,
      email_sent: emailSent,
      thought: personalizedThought,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Critical error in send-quote:', error.message || error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error',
    });
  }
}
