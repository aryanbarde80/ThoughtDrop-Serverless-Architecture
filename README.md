# ThoughtDrop 🌅🌙

**ThoughtDrop** is a production-ready serverless backend that sends daily automated Hinglish thoughts to your email. It features a gamified streak system, smart AI categorization, and a beautiful landing page with real-time stats tracking.

[**View Architecture Diagram**](./ARCHITECTURE.md) | [**Live Stats API**](/api/stats) | [**GitHub**](https://github.com/aryanbarde80/ThoughtDrop-Serverless-Architecture)

## 🎯 Features

- **🔥 Daily Streak System:** Tracks continuous days of quotes sent with automatic reset on missed days.
- **🧠 Smart Categories:** Randomly picks between Motivation, Discipline, Calm, and Focus categories.
- **🌅 Personalized Greetings:** Customizable user name and email recipient (configurable via environment variables).
- **🛡️ Security Hardening:** Cron-only access guard for API endpoints with manual test override.
- **📊 Analytics Endpoint:** `GET /api/stats` for real-time streak and delivery data with timestamps.
- **🛠️ Fail-safe System:** 3x AI retries with graceful fallback to curated Hinglish quotes.
- **🎭 AI Personality:** DeepSeek acts as a "wise mentor" for more soulful, contemplative thoughts.
- **⏰ IST Scheduling:** Optimized for 6 AM and 6 PM IST (configurable via Vercel cron).
- **📧 Robust Email Delivery:** Graceful error handling—quote is saved even if email fails.
- **🎨 Modern UI:** Beautiful, responsive landing page with real-time stats and test functionality.

## 🧠 Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Runtime** | Node.js (ES Modules) | Modern, fast, and industry-standard |
| **Hosting** | Vercel | Serverless functions with built-in cron support |
| **Database** | Turso (Serverless SQLite) | Edge-ready with extremely low latency |
| **AI Model** | DeepSeek API | High-quality Hinglish generation at low cost |
| **Email** | Brevo SMTP | Reliable delivery with high deliverability rates |
| **Frontend** | React 19 + Tailwind CSS | Modern, responsive UI with real-time updates |

## 📁 Project Structure

```
.
├── api/
│   ├── index.js           # Root UI handler with landing page
│   ├── send-quote.js      # Main cron function for quote generation & delivery
│   ├── init-db.js         # Database initialization script
│   └── stats.js           # Real-time analytics endpoint
├── lib/
│   ├── db.js              # Turso database connection
│   ├── ai.js              # DeepSeek AI logic with retry mechanism
│   ├── email.js           # Brevo SMTP email sender
│   └── fallbacks.js       # Curated Hinglish fallback quotes
├── vercel.json            # Cron job configuration
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
└── ARCHITECTURE.md        # System architecture diagram
```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ with pnpm
- Turso database account (free tier available)
- DeepSeek API key
- Brevo email account (free tier available)

### 2. Clone the Repository

```bash
git clone https://github.com/aryanbarde80/ThoughtDrop-Serverless-Architecture.git
cd ThoughtDrop-Serverless-Architecture
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

**Required Variables:**
- `TURSO_DATABASE_URL` - Your Turso database URL
- `TURSO_AUTH_TOKEN` - Your Turso authentication token
- `DEEPSEEK_API_KEY` - Your DeepSeek API key
- `BREVO_LOGIN_EMAIL` - Your Brevo login email
- `BREVO_SMTP_KEY` - Your Brevo SMTP key

**Optional Variables:**
- `USER_NAME` - Name for personalization (default: "Aryan")
- `RECIPIENT_EMAIL` - Email to receive thoughts (default: "aryanbarde80@gmail.com")
- `SENDER_EMAIL` - Email to send from (default: BREVO_LOGIN_EMAIL)
- `NODE_ENV` - Set to "development" for testing

### 4. Initialize Database

```bash
npm run init-db
```

This creates two tables:
- `quotes` - Stores all generated and fallback quotes
- `stats` - Tracks streak, total sent, and last sent date

### 5. Test Locally

```bash
npm start
```

This runs the send-quote handler with `NODE_ENV=development`, which bypasses the cron guard.

### 6. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel project settings
4. Vercel automatically picks up cron jobs from `vercel.json`

## 🔧 API Endpoints

### Send Quote (Cron)
```
GET /api/send-quote?type=morning
GET /api/send-quote?type=evening
GET /api/send-quote?type=morning&test=true  # Manual test
```

**Response:**
```json
{
  "success": true,
  "streak": 5,
  "thought": "Good Morning Aryan 🌅\n\nHar din ek naya mauka hai.",
  "timestamp": "2026-05-06T00:30:00.000Z"
}
```

### Get Stats
```
GET /api/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "streak": 5,
    "total_sent": 42,
    "total_in_db": 87,
    "last_sent_at": "2026-05-06T00:30:00.000Z",
    "last_thought": "Har din ek naya mauka hai.",
    "timestamp": "2026-05-06T00:35:00.000Z"
  }
}
```

### Initialize Database
```
GET /api/init-db
```

Or run locally:
```bash
npm run init-db
```

## ⏰ Cron Schedule

The system sends quotes at:
- **6:00 AM UTC** (12:30 PM IST) - Morning thought
- **12:30 PM UTC** (6:00 PM IST) - Evening thought

Configure in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/send-quote?type=morning",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/send-quote?type=evening",
      "schedule": "30 12 * * *"
    }
  ]
}
```

## 🔐 Security Features

1. **Cron Guard:** Endpoint checks for `x-vercel-cron: 1` header
2. **Manual Override:** `?test=true` parameter for testing (respects NODE_ENV)
3. **Duplicate Prevention:** Checks last 20 quotes before saving new ones
4. **Graceful Degradation:** Falls back to curated quotes if AI fails
5. **Error Isolation:** Email failures don't prevent quote from being saved

## 🛠️ Troubleshooting

### Database Not Initialized
```
Error: Stats row not found. Please run init-db first.
```
**Solution:** Run `npm run init-db` to create tables and initialize stats.

### AI Generation Failing
```
Error: DEEPSEEK_API_KEY environment variable is not set
```
**Solution:** Ensure `DEEPSEEK_API_KEY` is set in `.env` and Vercel environment.

### Email Not Sending
```
Error: Brevo credentials not configured
```
**Solution:** Verify `BREVO_LOGIN_EMAIL` and `BREVO_SMTP_KEY` are correct.

### Streak Not Updating
The streak logic works as follows:
- First quote: streak = 1
- Same day: streak unchanged
- Next day: streak += 1
- Skip day: streak reset to 1

## 📊 Monitoring

### View Real-time Stats
Visit `/api/stats` to see current streak, total quotes sent, and last thought.

### Check Logs
In Vercel dashboard:
1. Go to your project
2. Navigate to "Logs" → "Function Logs"
3. Filter by `/api/send-quote` or `/api/stats`

### Manual Testing
```bash
curl "http://localhost:3000/api/send-quote?type=morning&test=true"
```

## 🎨 Customization

### Change Greeting
Edit `api/send-quote.js` line 65-68:
```javascript
const personalizedThought = type === 'morning' 
  ? `Good Morning ${userName} 🌅\n\n${thought}`
  : `Hope your evening is peaceful ${userName} 🌙\n\n${thought}`;
```

### Add Categories
Edit `lib/ai.js` line 11:
```javascript
const CATEGORIES = ['motivation', 'discipline', 'calm', 'focus', 'wisdom'];
```

### Modify Fallback Quotes
Edit `lib/fallbacks.js` to add more Hinglish quotes.

## 📈 Performance

- **Cold Start:** < 1 second (Vercel optimized)
- **Database Latency:** < 50ms (Turso edge)
- **AI Response:** 2-5 seconds (DeepSeek)
- **Email Delivery:** < 2 seconds (Brevo)

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

ISC License - See LICENSE file for details

## 🙏 Acknowledgments

- Built with [Vercel](https://vercel.com)
- Database by [Turso](https://turso.tech)
- AI by [DeepSeek](https://deepseek.com)
- Email by [Brevo](https://brevo.com)

---

**Questions?** Open an issue on GitHub or check the [Architecture](./ARCHITECTURE.md) for more details.
