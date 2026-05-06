import client from '../lib/db.js';

export default async function handler(req, res) {
  try {
    const statsResult = await client.execute('SELECT * FROM stats WHERE id = 1');
    const stats = statsResult.rows[0];

    if (!stats) {
      return res.status(503).json({
        success: false,
        error: 'Database not initialized',
        message: 'Please visit /api/init-db to initialize the database.',
      });
    }

    const totalQuotesResult = await client.execute('SELECT COUNT(*) as count FROM quotes');
    const totalQuotes = totalQuotesResult.rows[0]?.count || 0;

    const lastQuoteResult = await client.execute(
      'SELECT text, type, category, created_at FROM quotes ORDER BY created_at DESC LIMIT 1'
    );
    const lastQuote = lastQuoteResult.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        streak: stats.streak || 0,
        total_sent: stats.total_sent || 0,
        total_in_db: Number(totalQuotes),
        last_sent_at: lastQuote?.created_at || null,
        last_thought: lastQuote?.text || null,
        last_type: lastQuote?.type || null,
        last_category: lastQuote?.category || null,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Stats fetch failed:', error.message || error);

    // Handle case where table doesn't exist yet
    if (error.message?.includes('no such table')) {
      return res.status(503).json({
        success: false,
        error: 'Database not initialized',
        message: 'Please visit /api/init-db to initialize the database.',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
      message: error.message || 'Unknown error',
    });
  }
}
