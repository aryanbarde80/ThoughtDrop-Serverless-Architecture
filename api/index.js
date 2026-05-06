export default function handler(req, res) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ThoughtDrop | Wise Thoughts Delivered</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Inter', sans-serif; }
            .gradient-text {
                background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .card {
                background: rgba(15, 23, 42, 0.6);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(99, 102, 241, 0.2);
            }
            @keyframes pulse-glow {
                0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
                50% { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0); }
            }
            .glow-btn { animation: pulse-glow 2s infinite; }
        </style>
    </head>
    <body class="bg-slate-950 text-slate-200 min-h-screen flex flex-col items-center justify-center p-6">
        <div class="max-w-2xl w-full text-center space-y-10">

            <!-- Header -->
            <div class="space-y-3">
                <div class="text-6xl mb-4">🌅</div>
                <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight gradient-text">ThoughtDrop</h1>
                <p class="text-slate-400 text-lg md:text-xl max-w-md mx-auto leading-relaxed">
                    Daily Hinglish wisdom from a wise mentor, delivered straight to your inbox.
                </p>
            </div>

            <!-- Feature cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="card p-6 rounded-2xl">
                    <div class="text-3xl mb-3">🌅</div>
                    <div class="font-semibold text-white">Morning</div>
                    <div class="text-sm text-slate-500 mt-1">6:00 AM IST</div>
                </div>
                <div class="card p-6 rounded-2xl">
                    <div class="text-3xl mb-3">🌙</div>
                    <div class="font-semibold text-white">Evening</div>
                    <div class="text-sm text-slate-500 mt-1">6:00 PM IST</div>
                </div>
                <div class="card p-6 rounded-2xl">
                    <div class="text-3xl mb-3">🔥</div>
                    <div class="font-semibold text-white">Streaks</div>
                    <div class="text-sm text-slate-500 mt-1">Gamified Growth</div>
                </div>
            </div>

            <!-- Live stats -->
            <div id="statsBox" class="card p-6 rounded-2xl text-left hidden">
                <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">Live Stats</h2>
                <div class="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div id="statStreak" class="text-3xl font-bold text-indigo-400">—</div>
                        <div class="text-xs text-slate-500 mt-1">Day Streak 🔥</div>
                    </div>
                    <div>
                        <div id="statTotal" class="text-3xl font-bold text-purple-400">—</div>
                        <div class="text-xs text-slate-500 mt-1">Thoughts Sent</div>
                    </div>
                    <div>
                        <div id="statDb" class="text-3xl font-bold text-pink-400">—</div>
                        <div class="text-xs text-slate-500 mt-1">In Database</div>
                    </div>
                </div>
                <div id="lastThought" class="mt-4 pt-4 border-t border-slate-800 text-sm text-slate-400 italic hidden"></div>
            </div>

            <!-- Actions -->
            <div class="flex flex-wrap justify-center gap-4">
                <button onclick="triggerTest('morning')" id="testBtnMorning"
                    class="glow-btn inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-full transition-all">
                    🌅 Send Morning
                </button>
                <button onclick="triggerTest('evening')" id="testBtnEvening"
                    class="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-full transition-all">
                    🌙 Send Evening
                </button>
                <a href="/api/stats"
                    class="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-full transition-all">
                    📊 Raw Stats
                </a>
                <a href="/api/init-db"
                    class="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-full transition-all">
                    🗄️ Init DB
                </a>
            </div>

            <!-- Status message -->
            <div id="status" class="hidden text-sm font-mono p-4 rounded-xl bg-slate-900 border border-slate-800 max-w-md mx-auto text-left"></div>

            <script>
                // Load stats on page load
                async function loadStats() {
                    try {
                        const res = await fetch('/api/stats');
                        const data = await res.json();
                        if (data.success) {
                            document.getElementById('statsBox').classList.remove('hidden');
                            document.getElementById('statStreak').innerText = data.data.streak;
                            document.getElementById('statTotal').innerText = data.data.total_sent;
                            document.getElementById('statDb').innerText = data.data.total_in_db;
                            if (data.data.last_thought) {
                                const el = document.getElementById('lastThought');
                                el.classList.remove('hidden');
                                el.innerText = '"' + data.data.last_thought + '"';
                            }
                        }
                    } catch (e) {
                        console.log('Stats not available yet');
                    }
                }

                async function triggerTest(type) {
                    const btnId = type === 'morning' ? 'testBtnMorning' : 'testBtnEvening';
                    const btn = document.getElementById(btnId);
                    const status = document.getElementById('status');

                    btn.disabled = true;
                    btn.innerText = 'Sending...';
                    status.classList.remove('hidden');
                    status.innerText = '⏳ Generating thought and sending email...';
                    status.className = 'text-sm font-mono p-4 rounded-xl bg-slate-900 border border-slate-800 max-w-md mx-auto text-slate-400';

                    try {
                        const res = await fetch('/api/send-quote?type=' + type + '&test=true');
                        const data = await res.json();

                        if (data.success) {
                            const emailMsg = data.email_sent ? '📧 Email sent!' : '⚠️ Thought saved but email failed.';
                            status.innerText = '✅ Success! Streak: ' + data.streak + ' | ' + emailMsg + '\\n\\n' + data.thought;
                            status.className = 'text-sm font-mono p-4 rounded-xl bg-emerald-900/20 border border-emerald-800/50 max-w-md mx-auto text-emerald-400 whitespace-pre-wrap';
                            loadStats();
                        } else {
                            throw new Error(data.error || data.message || 'Unknown error');
                        }
                    } catch (err) {
                        status.innerText = '❌ Error: ' + err.message;
                        status.className = 'text-sm font-mono p-4 rounded-xl bg-rose-900/20 border border-rose-800/50 max-w-md mx-auto text-rose-400';
                    } finally {
                        btn.disabled = false;
                        btn.innerText = type === 'morning' ? '🌅 Send Morning' : '🌙 Send Evening';
                    }
                }

                loadStats();
            </script>

            <footer class="pt-6 text-slate-600 text-sm">
                Built with Node.js · Vercel · Turso · DeepSeek · Brevo
            </footer>
        </div>
    </body>
    </html>
  `;
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
