export default function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ThoughtDrop — Daily Wisdom, Delivered</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #080b12;
      --surface: #0d1220;
      --surface2: #111827;
      --border: rgba(255,255,255,0.06);
      --border-glow: rgba(139,92,246,0.3);
      --text: #f0f4ff;
      --text-muted: #6b7a99;
      --text-dim: #3d4a63;
      --violet: #8b5cf6;
      --violet-light: #a78bfa;
      --gold: #f59e0b;
      --gold-light: #fcd34d;
      --rose: #f43f5e;
      --teal: #14b8a6;
      --morning: #f59e0b;
      --evening: #8b5cf6;
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      font-weight: 300;
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* ── Canvas background ── */
    #canvas-bg {
      position: fixed; inset: 0; z-index: 0;
      pointer-events: none;
    }

    /* ── Noise grain overlay ── */
    body::after {
      content: '';
      position: fixed; inset: 0; z-index: 1;
      pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
      opacity: 0.4;
    }

    /* ── Layout ── */
    .wrapper {
      position: relative; z-index: 2;
      max-width: 900px;
      margin: 0 auto;
      padding: 0 24px 80px;
    }

    /* ── Nav ── */
    nav {
      position: relative; z-index: 10;
      display: flex; align-items: center; justify-content: space-between;
      padding: 28px 0 0;
    }
    .nav-logo {
      font-family: 'DM Mono', monospace;
      font-size: 13px;
      color: var(--text-muted);
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }
    .nav-links { display: flex; gap: 8px; }
    .nav-link {
      font-size: 12px;
      font-family: 'DM Mono', monospace;
      color: var(--text-dim);
      text-decoration: none;
      padding: 6px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      transition: all 0.2s;
    }
    .nav-link:hover { color: var(--text-muted); border-color: var(--border-glow); }

    /* ── Hero ── */
    .hero {
      padding: 80px 0 60px;
      text-align: center;
    }
    .hero-eyebrow {
      display: inline-flex; align-items: center; gap: 8px;
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--violet-light);
      background: rgba(139,92,246,0.1);
      border: 1px solid rgba(139,92,246,0.2);
      padding: 6px 16px;
      border-radius: 100px;
      margin-bottom: 32px;
      opacity: 0;
      animation: fadeUp 0.6s 0.2s ease forwards;
    }
    .hero-eyebrow::before {
      content: '';
      width: 6px; height: 6px;
      background: var(--violet);
      border-radius: 50%;
      animation: blink 1.5s infinite;
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

    .hero-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(52px, 9vw, 96px);
      font-weight: 900;
      line-height: 0.95;
      letter-spacing: -0.02em;
      margin-bottom: 24px;
      opacity: 0;
      animation: fadeUp 0.7s 0.35s ease forwards;
    }
    .hero-title em {
      font-style: italic;
      background: linear-gradient(135deg, var(--gold) 0%, var(--rose) 50%, var(--violet-light) 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }

    .hero-sub {
      font-size: 18px;
      color: var(--text-muted);
      max-width: 480px;
      margin: 0 auto 48px;
      line-height: 1.7;
      font-weight: 300;
      opacity: 0;
      animation: fadeUp 0.7s 0.5s ease forwards;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Stats strip ── */
    .stats-strip {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1px;
      background: var(--border);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 40px;
      opacity: 0;
      animation: fadeUp 0.7s 0.65s ease forwards;
    }
    .stat-cell {
      background: var(--surface);
      padding: 28px 20px;
      text-align: center;
      transition: background 0.3s;
    }
    .stat-cell:hover { background: var(--surface2); }
    .stat-num {
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 6px;
      transition: all 0.4s;
    }
    .stat-num.violet { color: var(--violet-light); }
    .stat-num.gold   { color: var(--gold-light); }
    .stat-num.teal   { color: var(--teal); }
    .stat-label {
      font-family: 'DM Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--text-dim);
    }

    /* ── Last thought card ── */
    .thought-card {
      position: relative;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 32px;
      overflow: hidden;
      opacity: 0;
      animation: fadeUp 0.7s 0.75s ease forwards;
      transition: border-color 0.3s;
    }
    .thought-card:hover { border-color: var(--border-glow); }
    .thought-card::before {
      content: '"';
      position: absolute;
      top: -10px; left: 20px;
      font-family: 'Playfair Display', serif;
      font-size: 120px;
      color: rgba(139,92,246,0.08);
      line-height: 1;
      pointer-events: none;
      user-select: none;
    }
    .thought-label {
      font-family: 'DM Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--text-dim);
      margin-bottom: 12px;
    }
    .thought-text {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      font-style: italic;
      line-height: 1.5;
      color: var(--text);
      min-height: 36px;
    }
    .thought-text.empty { color: var(--text-dim); font-size: 16px; font-style: normal; font-family: 'DM Sans', sans-serif; }
    .thought-meta {
      display: flex; align-items: center; gap: 8px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }
    .thought-badge {
      font-family: 'DM Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.15em;
      padding: 3px 10px;
      border-radius: 100px;
      border: 1px solid;
    }
    .badge-morning { color: var(--gold); border-color: rgba(245,158,11,0.3); background: rgba(245,158,11,0.08); }
    .badge-evening { color: var(--violet-light); border-color: rgba(139,92,246,0.3); background: rgba(139,92,246,0.08); }
    .badge-fallback { color: var(--text-dim); border-color: var(--border); }

    /* ── Action buttons ── */
    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 32px;
      opacity: 0;
      animation: fadeUp 0.7s 0.85s ease forwards;
    }
    .btn {
      position: relative;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      font-weight: 500;
      padding: 18px 24px;
      border-radius: 12px;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.25s;
      overflow: hidden;
      text-decoration: none;
    }
    .btn::after {
      content: '';
      position: absolute; inset: 0;
      background: white;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .btn:active::after { opacity: 0.06; }

    .btn-morning {
      background: linear-gradient(135deg, #92400e, #78350f);
      border-color: rgba(245,158,11,0.3);
      color: var(--gold-light);
    }
    .btn-morning:hover {
      background: linear-gradient(135deg, #b45309, #92400e);
      border-color: rgba(245,158,11,0.5);
      transform: translateY(-1px);
      box-shadow: 0 8px 32px rgba(245,158,11,0.2);
    }
    .btn-evening {
      background: linear-gradient(135deg, #3b0764, #2e1065);
      border-color: rgba(139,92,246,0.3);
      color: var(--violet-light);
    }
    .btn-evening:hover {
      background: linear-gradient(135deg, #4c1d95, #3b0764);
      border-color: rgba(139,92,246,0.5);
      transform: translateY(-1px);
      box-shadow: 0 8px 32px rgba(139,92,246,0.25);
    }
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }

    .btn-icon { font-size: 18px; }

    /* Loading spinner */
    .spinner {
      width: 16px; height: 16px;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: none;
    }
    .btn.loading .spinner { display: block; }
    .btn.loading .btn-icon { display: none; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Status toast ── */
    .toast {
      padding: 20px 24px;
      border-radius: 12px;
      font-family: 'DM Mono', monospace;
      font-size: 13px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
      display: none;
      margin-bottom: 32px;
      border: 1px solid;
      animation: slideIn 0.3s ease;
      opacity: 0;
      animation: fadeUp 0.4s ease forwards;
    }
    .toast.success {
      background: rgba(20,184,166,0.08);
      border-color: rgba(20,184,166,0.25);
      color: #5eead4;
    }
    .toast.error {
      background: rgba(244,63,94,0.08);
      border-color: rgba(244,63,94,0.25);
      color: #fb7185;
    }
    .toast.info {
      background: rgba(139,92,246,0.08);
      border-color: rgba(139,92,246,0.25);
      color: var(--violet-light);
    }

    /* ── Cron schedule ── */
    .schedule {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 32px;
      opacity: 0;
      animation: fadeUp 0.7s 0.95s ease forwards;
    }
    .schedule-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      display: flex; align-items: center; gap: 16px;
      transition: border-color 0.3s;
    }
    .schedule-card:hover { border-color: var(--border-glow); }
    .schedule-icon { font-size: 28px; flex-shrink: 0; }
    .schedule-info { flex: 1; }
    .schedule-time {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      font-weight: 700;
      color: var(--text);
    }
    .schedule-label {
      font-family: 'DM Mono', monospace;
      font-size: 10px;
      color: var(--text-dim);
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .schedule-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .dot-gold { background: var(--gold); box-shadow: 0 0 8px var(--gold); animation: blink 2s infinite; }
    .dot-violet { background: var(--violet); box-shadow: 0 0 8px var(--violet); animation: blink 2s 1s infinite; }

    /* ── Utility links ── */
    .util-links {
      display: flex; gap: 8px; flex-wrap: wrap;
      opacity: 0;
      animation: fadeUp 0.7s 1.05s ease forwards;
    }
    .util-link {
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-dim);
      text-decoration: none;
      padding: 8px 14px;
      border: 1px solid var(--border);
      border-radius: 8px;
      transition: all 0.2s;
    }
    .util-link:hover { color: var(--text-muted); border-color: rgba(255,255,255,0.12); }

    /* ── Footer ── */
    footer {
      margin-top: 64px;
      padding-top: 32px;
      border-top: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 16px;
      opacity: 0;
      animation: fadeUp 0.7s 1.15s ease forwards;
    }
    .footer-left {
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      color: var(--text-dim);
      letter-spacing: 0.1em;
    }
    .footer-stack {
      display: flex; gap: 8px; flex-wrap: wrap;
    }
    .stack-badge {
      font-family: 'DM Mono', monospace;
      font-size: 10px;
      color: var(--text-dim);
      padding: 4px 10px;
      border: 1px solid var(--border);
      border-radius: 100px;
      letter-spacing: 0.1em;
    }

    /* ── Responsive ── */
    @media (max-width: 600px) {
      .actions, .schedule { grid-template-columns: 1fr; }
      .stats-strip { grid-template-columns: repeat(3, 1fr); }
      .stat-num { font-size: 30px; }
      nav { flex-direction: column; gap: 16px; align-items: flex-start; }
    }
  </style>
</head>
<body>

<canvas id="canvas-bg"></canvas>

<div class="wrapper">

  <nav>
    <span class="nav-logo">ThoughtDrop</span>
    <div class="nav-links">
      <a href="/api/stats" class="nav-link">Stats API</a>
      <a href="/api/init-db" class="nav-link">Init DB</a>
      <a href="https://github.com/aryanbarde80/ThoughtDrop-Serverless-Architecture" target="_blank" class="nav-link">GitHub ↗</a>
    </div>
  </nav>

  <!-- Hero -->
  <div class="hero">
    <div class="hero-eyebrow">Daily Hinglish Wisdom</div>
    <h1 class="hero-title">Drop a<br><em>Thought.</em></h1>
    <p class="hero-sub">AI-powered Hinglish thoughts delivered to your inbox every morning and evening. Built on a serverless streak system.</p>
  </div>

  <!-- Stats strip -->
  <div class="stats-strip">
    <div class="stat-cell">
      <div class="stat-num violet" id="statStreak">—</div>
      <div class="stat-label">Day Streak 🔥</div>
    </div>
    <div class="stat-cell">
      <div class="stat-num gold" id="statTotal">—</div>
      <div class="stat-label">Thoughts Sent</div>
    </div>
    <div class="stat-cell">
      <div class="stat-num teal" id="statDb">—</div>
      <div class="stat-label">In Database</div>
    </div>
  </div>

  <!-- Last thought card -->
  <div class="thought-card">
    <div class="thought-label">Last Thought Delivered</div>
    <div class="thought-text empty" id="lastThought">Loading latest thought...</div>
    <div class="thought-meta" id="thoughtMeta" style="display:none">
      <span class="thought-badge" id="thoughtBadge"></span>
      <span class="thought-badge" id="categoryBadge" style="color:var(--text-dim);border-color:var(--border)"></span>
    </div>
  </div>

  <!-- Toast -->
  <div class="toast" id="toast"></div>

  <!-- Action buttons -->
  <div class="actions">
    <button class="btn btn-morning" id="btnMorning" onclick="sendQuote('morning')">
      <div class="spinner"></div>
      <span class="btn-icon">🌅</span>
      <span>Send Morning Thought</span>
    </button>
    <button class="btn btn-evening" id="btnEvening" onclick="sendQuote('evening')">
      <div class="spinner"></div>
      <span class="btn-icon">🌙</span>
      <span>Send Evening Thought</span>
    </button>
  </div>

  <!-- Schedule cards -->
  <div class="schedule">
    <div class="schedule-card">
      <span class="schedule-icon">🌅</span>
      <div class="schedule-info">
        <div class="schedule-time">6:00 AM</div>
        <div class="schedule-label">Morning · IST Daily</div>
      </div>
      <div class="schedule-dot dot-gold"></div>
    </div>
    <div class="schedule-card">
      <span class="schedule-icon">🌙</span>
      <div class="schedule-info">
        <div class="schedule-time">6:00 PM</div>
        <div class="schedule-label">Evening · IST Daily</div>
      </div>
      <div class="schedule-dot dot-violet"></div>
    </div>
  </div>

  <!-- Util links -->
  <div class="util-links">
    <a href="/api/stats" class="util-link">📊 Raw Stats JSON</a>
    <a href="/api/send-quote?type=morning&test=true" class="util-link">🧪 Test Morning API</a>
    <a href="/api/send-quote?type=evening&test=true" class="util-link">🧪 Test Evening API</a>
    <a href="/api/init-db" class="util-link">🗄️ Init / Reset DB</a>
  </div>

  <!-- Footer -->
  <footer>
    <div class="footer-left">© 2026 ThoughtDrop · ISC License</div>
    <div class="footer-stack">
      <span class="stack-badge">Vercel</span>
      <span class="stack-badge">Turso</span>
      <span class="stack-badge">DeepSeek</span>
      <span class="stack-badge">Brevo</span>
      <span class="stack-badge">Node.js</span>
    </div>
  </footer>

</div>

<script>
  /* ── Particle canvas ── */
  (function() {
    const canvas = document.getElementById('canvas-bg');
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() { this.reset(true); }
      reset(init) {
        this.x = Math.random() * W;
        this.y = init ? Math.random() * H : H + 10;
        this.size = Math.random() * 1.5 + 0.3;
        this.speed = Math.random() * 0.3 + 0.1;
        this.opacity = Math.random() * 0.4 + 0.05;
        this.hue = Math.random() > 0.5 ? 260 : 40; // violet or gold
        this.drift = (Math.random() - 0.5) * 0.2;
      }
      update() {
        this.y -= this.speed;
        this.x += this.drift;
        if (this.y < -10) this.reset(false);
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = \`hsla(\${this.hue}, 70%, 70%, \${this.opacity})\`;
        ctx.fill();
      }
    }

    for (let i = 0; i < 80; i++) particles.push(new Particle());

    // Gradient mesh background
    function drawBg() {
      ctx.clearRect(0, 0, W, H);

      // Base dark gradient
      const bg = ctx.createRadialGradient(W * 0.3, H * 0.2, 0, W * 0.3, H * 0.2, W * 0.8);
      bg.addColorStop(0, 'rgba(30,15,60,0.8)');
      bg.addColorStop(1, 'rgba(8,11,18,0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const bg2 = ctx.createRadialGradient(W * 0.8, H * 0.7, 0, W * 0.8, H * 0.7, W * 0.6);
      bg2.addColorStop(0, 'rgba(60,20,10,0.5)');
      bg2.addColorStop(1, 'rgba(8,11,18,0)');
      ctx.fillStyle = bg2;
      ctx.fillRect(0, 0, W, H);

      particles.forEach(p => { p.update(); p.draw(); });
    }

    function loop() { drawBg(); requestAnimationFrame(loop); }
    loop();
  })();

  /* ── Stats loader ── */
  async function loadStats() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        animateNum('statStreak', data.data.streak);
        animateNum('statTotal', data.data.total_sent);
        animateNum('statDb', data.data.total_in_db);

        const thoughtEl = document.getElementById('lastThought');
        if (data.data.last_thought) {
          thoughtEl.classList.remove('empty');
          thoughtEl.textContent = data.data.last_thought;

          const meta = document.getElementById('thoughtMeta');
          meta.style.display = 'flex';

          const typeBadge = document.getElementById('thoughtBadge');
          const cat = document.getElementById('categoryBadge');
          typeBadge.textContent = data.data.last_type || 'thought';
          typeBadge.className = 'thought-badge ' + (data.data.last_type === 'morning' ? 'badge-morning' : 'badge-evening');
          cat.textContent = data.data.last_category || '';
        } else {
          thoughtEl.textContent = 'No thoughts sent yet. Hit a button above to start!';
        }
      }
    } catch (e) {
      document.getElementById('lastThought').textContent = 'Stats unavailable — DB may need init.';
    }
  }

  function animateNum(id, target) {
    const el = document.getElementById(id);
    const start = parseInt(el.textContent) || 0;
    const end = parseInt(target) || 0;
    const dur = 800;
    const startTime = performance.now();
    function tick(now) {
      const t = Math.min((now - startTime) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(start + (end - start) * ease);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ── Send quote ── */
  async function sendQuote(type) {
    const btnId = type === 'morning' ? 'btnMorning' : 'btnEvening';
    const btn = document.getElementById(btnId);
    const toast = document.getElementById('toast');

    btn.classList.add('loading');
    btn.disabled = true;
    document.getElementById(type === 'morning' ? 'btnEvening' : 'btnMorning').disabled = true;

    toast.className = 'toast info';
    toast.style.display = 'block';
    toast.textContent = '⏳  Calling DeepSeek AI... generating your Hinglish thought...';

    try {
      const res = await fetch('/api/send-quote?type=' + type + '&test=true');
      const data = await res.json();

      if (data.success) {
        const emailLine = data.email_sent
          ? '📧  Email delivered to inbox'
          : '⚠️  Thought saved — email delivery failed (check Brevo credentials)';

        toast.className = 'toast success';
        toast.textContent =
          '✅  Thought Generated!\\n\\n' +
          data.thought + '\\n\\n' +
          '🔥  Streak: ' + data.streak + ' days   |   ' + emailLine;

        loadStats();

        // Update thought card live
        const thoughtEl = document.getElementById('lastThought');
        thoughtEl.classList.remove('empty');
        thoughtEl.textContent = data.thought.split('\\n\\n').slice(1).join(' ') || data.thought;
        document.getElementById('thoughtMeta').style.display = 'flex';
        const tb = document.getElementById('thoughtBadge');
        tb.textContent = type;
        tb.className = 'thought-badge ' + (type === 'morning' ? 'badge-morning' : 'badge-evening');
        document.getElementById('categoryBadge').textContent = data.category || 'ai';

      } else {
        throw new Error(data.error || data.message || 'Unknown error');
      }
    } catch (err) {
      toast.className = 'toast error';
      toast.textContent = '❌  Error: ' + err.message;
    } finally {
      btn.classList.remove('loading');
      btn.disabled = false;
      document.getElementById(type === 'morning' ? 'btnEvening' : 'btnMorning').disabled = false;
    }
  }

  loadStats();
</script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
