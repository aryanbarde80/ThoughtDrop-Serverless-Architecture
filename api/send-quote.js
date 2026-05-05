import client from '../lib/db.js';
import { generateThought } from '../lib/ai.js';
import { sendEmail } from '../lib/email.js';
import { getRandomFallback } from '../lib/fallbacks.js';

export default async function handler(req, res) {
  // 1. Security Hardening: Cron-only access guard (Allow manual test via query param)
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
    // 2. Fetch last 20 quotes for context
    const lastQuotesResult = await client.execute({
      sql: 'SELECT text FROM quotes ORDER BY created_at DESC LIMIT 20',
      args: []
    });
    const previousQuotes = lastQuotesResult.rows.map(row => row.text);

    let thoughtData;
    let thought;
    let category;
    let isDuplicate = true;
    let attempts = 0;
    const maxAttempts = 3; // Fail-safe retry system

    // 3. Generate thought with retry logic
    while (isDuplicate && attempts < maxAttempts) {
      attempts++;
      try {
        thoughtData = await generateThought(type, previousQuotes);
        thought = thoughtData.thought;
        category = thoughtData.category;

        const checkResult = await client.execute({
          sql: 'SELECT id FROM quotes WHERE text = ?',
          args: [thought]
        });
        
        if (checkResult.rows.length === 0) {
          isDuplicate = false;
        }
      } catch (aiError) {
        console.error(`AI Attempt ${attempts} failed:`, aiError);
      }
    }

    // 4. Fallback if AI fails or duplicate persists
    if (isDuplicate || !thought) {
      console.log('Using fallback quote...');
      thought = getRandomFallback(type);
      category = 'fallback';
    }

    // 5. Personalization
    const personalizedThought = type === 'morning' 
      ? `Good Morning Aryan 🌅\n\n${thought}`
      : `Hope your evening is peaceful Aryan 🌙\n\n${thought}`;

    // 6. Update Stats & Streak
    const today = new Date().toISOString().split('T')[0];
    const statsResult = await client.execute('SELECT * FROM stats WHERE id = 1');
    const stats = statsResult.rows[0];
    
    let newStreak = stats.streak;
    const lastDate = stats.last_sent_date;

    if (!lastDate) {
      newStreak = 1;
    } else {
      const last = new Date(lastDate);
      const current = new Date(today);
      const diffDays = Math.floor((current - last) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1; // Reset streak
      }
    }

    // 7. Save to DB (Transaction-like)
    await client.batch([
      {
        sql: 'INSERT INTO quotes (text, type, category) VALUES (?, ?, ?)',
        args: [thought, type, category]
      },
      {
        sql: 'UPDATE stats SET streak = ?, last_sent_date = ?, total_sent = total_sent + 1 WHERE id = 1',
        args: [newStreak, today]
      }
    ], 'write');

    // 8. Send Email
    await sendEmail(type, personalizedThought);

    return res.status(200).json({ 
      success: true, 
      streak: newStreak,
      thought: personalizedThought 
    });

  } catch (error) {
    console.error('Critical error in send-quote:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
