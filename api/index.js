export default function handler(req, res) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ThoughtDrop | Wise Thoughts Delivered</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Inter', sans-serif; }
            .gradient-text {
                background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
        </style>
    </head>
    <body class="bg-slate-950 text-slate-200 min-h-screen flex flex-col items-center justify-center p-6">
        <div class="max-w-2xl w-full text-center space-y-8">
            <div class="space-y-2">
                <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight gradient-text">ThoughtDrop</h1>
                <p class="text-slate-400 text-lg md:text-xl">Daily Hinglish thoughts from a wise mentor, delivered to your inbox.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                    <div class="text-3xl mb-2">🌅</div>
                    <div class="font-semibold">Morning</div>
                    <div class="text-sm text-slate-500">6:00 AM IST</div>
                </div>
                <div class="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                    <div class="text-3xl mb-2">🌙</div>
                    <div class="font-semibold">Evening</div>
                    <div class="text-sm text-slate-500">6:00 PM IST</div>
                </div>
                <div class="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                    <div class="text-3xl mb-2">🔥</div>
                    <div class="font-semibold">Streaks</div>
                    <div class="text-sm text-slate-500">Gamified Growth</div>
                </div>
            </div>

            <div class="pt-8 space-x-4">
                <a href="/api/stats" class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-full transition-all">
                    View My Stats
                </a>
                <a href="https://github.com/aryanbarde80/ThoughtDrop" target="_blank" class="inline-block bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3 rounded-full transition-all">
                    GitHub Repo
                </a>
            </div>

            <footer class="pt-12 text-slate-600 text-sm">
                Built with Node.js, Vercel, Turso, DeepSeek & Brevo.
            </footer>
        </div>
    </body>
    </html>
  `;
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
