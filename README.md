# ThoughtDrop 🌅🌙

ThoughtDrop is a production-ready serverless backend that sends daily automated Hinglish thoughts to your email.

## 🎯 Features

- **🔥 Daily Streak System:** Tracks continuous days of quotes sent.
- **🧠 Smart Categories:** Randomly picks between Motivation, Discipline, Calm, and Focus.
- **🌅 Personalized Greetings:** "Good Morning Aryan" & "Hope your evening is peaceful Aryan".
- **🛡️ Security Hardening:** Cron-only access guard for API endpoints.
- **📊 Analytics Endpoint:** `GET /api/stats` for real-time streak and delivery data.
- **🛠️ Fail-safe System:** 3x AI retries with a curated fallback system.
- **🎭 AI Personality:** DeepSeek acts as a "wise mentor" for more soulful thoughts.
- **⏰ IST Scheduling:** Optimized for 6 AM and 6 PM IST.

## 🧠 Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Hosting:** Vercel
- **Database:** Turso (Serverless SQLite)
- **AI:** DeepSeek API
- **Email:** Brevo SMTP

## 📁 Project Structure

- `/api/send-quote.js`: Main cron function.
- `/api/init-db.js`: Database setup script.
- `/lib/db.js`: Turso database connection.
- `/lib/ai.js`: DeepSeek AI logic.
- `/lib/email.js`: Brevo SMTP email sender.
- `vercel.json`: Cron job configuration.

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/aryanbarde80/ThoughtDrop.git
cd ThoughtDrop
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory and add the following:
```env
TURSO_DATABASE_URL=your_turso_url
TURSO_AUTH_TOKEN=your_turso_token
DEEPSEEK_API_KEY=your_deepseek_key
BREVO_LOGIN_EMAIL=your_brevo_login
BREVO_SMTP_KEY=your_brevo_smtp_key
```

### 3. Initialize Database
Run the initialization script to create the `quotes` table:
```bash
npm run init-db
```

### 4. Deploy to Vercel
1. Push the code to your GitHub repository.
2. Connect your repository to Vercel.
3. Add the environment variables in the Vercel project settings.
4. Vercel will automatically pick up the cron jobs from `vercel.json`.

## ⏰ Cron Schedule
- **Morning:** 6:00 AM UTC
- **Evening:** 6:00 PM UTC

## 🔐 License
ISC
