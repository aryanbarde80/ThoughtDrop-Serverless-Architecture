import client from '../lib/db.js';
import { generateThought } from '../lib/ai.js';
import { sendEmail } from '../lib/email.js';

export default async function handler(req, res) {
  // Check for cron authorization if needed, but Vercel handles this via vercel.json
  const { type } = req.query;
  
  if (!type || (type !== 'morning' && type !== 'evening')) {
    return res.status(400).json({ error: 'Invalid type. Must be "morning" or "evening".' });
  }

  try {
    // 1. Fetch last 20 quotes from DB
    const lastQuotesResult = await client.execute({
      sql: 'SELECT text FROM quotes ORDER BY created_at DESC LIMIT 20',
      args: []
    });
    const previousQuotes = lastQuotesResult.rows.map(row => row.text);

    let thought;
    let isDuplicate = true;
    let attempts = 0;
    const maxAttempts = 2;

    // 2 & 3. Generate new quote and check duplication (retry logic max 2 attempts)
    while (isDuplicate && attempts < maxAttempts) {
      attempts++;
      thought = await generateThought(type, previousQuotes);
      
      const checkResult = await client.execute({
        sql: 'SELECT id FROM quotes WHERE text = ?',
        args: [thought]
      });
      
      if (checkResult.rows.length === 0) {
        isDuplicate = false;
      }
    }

    if (isDuplicate) {
      return res.status(500).json({ error: 'Failed to generate a unique thought after multiple attempts.' });
    }

    // 4. Save quote to DB
    await client.execute({
      sql: 'INSERT INTO quotes (text, type) VALUES (?, ?)',
      args: [thought, type]
    });

    // 5. Send email via Brevo SMTP
    await sendEmail(type, thought);

    // 6. Return success response
    return res.status(200).json({ 
      success: true, 
      message: `Successfully sent ${type} thought.`,
      thought 
    });

  } catch (error) {
    console.error('Error in send-quote handler:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
