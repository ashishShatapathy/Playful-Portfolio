/* script.js — interactions for playful portfolio */
/* Save this file as script.js and ensure index.html references it with defer. */

/* -------------------------
   Small setup & helpers
   ------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('year').textContent = new Date().getFullYear();
    initParticles();           // animated background
    initSkillCloud();          // skill badges + meter
    initProjectDemos();        // open playable demos
    initModalHandlers();       // demo modal
    initContactForm();         // EmailJS contact
    initHeaderButtons();       // hires/resume
    animateMiniMeters();       // initial small meters on profile card
    initGame();                // bouncing ball game
});

/* -----------------------------------
   Particles: cursor-reactive particles
   lightweight custom implementation
   ----------------------------------- */
function initParticles() {
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    let w = canvas.width = innerWidth;
    let h = canvas.height = innerHeight;
    const particles = [];
    const count = Math.round((w * h) / 90000); // scale to viewport

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            size: 1 + Math.random() * 2,
            hue: 200 + Math.random() * 140
        });
    }

    const pointer = { x: -9999, y: -9999 };
    window.addEventListener('mousemove', e => { pointer.x = e.clientX; pointer.y = e.clientY; });
    window.addEventListener('resize', () => { w = canvas.width = innerWidth; h = canvas.height = innerHeight; });

    function step() {
        ctx.clearRect(0, 0, w, h);
        for (let p of particles) {
            // move
            p.x += p.vx; p.y += p.vy;
            // wrap
            if (p.x < -10) p.x = w + 10;
            if (p.x > w + 10) p.x = -10;
            if (p.y < -10) p.y = h + 10;
            if (p.y > h + 10) p.y = -10;

            // attract to pointer
            const dx = pointer.x - p.x;
            const dy = pointer.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                p.vx += dx * 0.0006;
                p.vy += dy * 0.0006;
            } else {
                // subtle drift back to center
                p.vx += (0.5 - Math.random()) * 0.001;
                p.vy += (0.5 - Math.random()) * 0.001;
            }

            // draw glow particle
            const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 18);
            grd.addColorStop(0, `hsla(${p.hue}, 90%, 70%, 0.12)`);
            grd.addColorStop(1, `hsla(${p.hue}, 80%, 45%, 0)`);
            ctx.fillStyle = grd;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, 0.9)`;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        }
        requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

/* -----------------------------------
   Skill cloud and meter behavior
   ----------------------------------- */
function initSkillCloud() {
    const skillCategories = {
        frontend: { skills: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Bootstrap'], weights: [10, 10, 15, 15, 10] },
        backend: { skills: ['MySQL', 'SpringBoot'], weights: [10, 12] },
        tools: { skills: ['Git', 'Linux'], weights: [8, 8] }
    };
    const meterFill = document.getElementById('meterLargeFill');
    const meterPct = document.getElementById('meterLargePct');

    // render badges for each category
    Object.keys(skillCategories).forEach(cat => {
        const cloud = document.getElementById(cat + 'Cloud');
        const { skills, weights } = skillCategories[cat];
        skills.forEach((s, i) => {
            const b = document.createElement('button');
            b.className = 'skill-badge';
            b.textContent = s;
            b.dataset.weight = weights[i];
            cloud.appendChild(b);
        });
    });

    // interaction - delegate to document for all clouds
    document.addEventListener('click', e => {
        const b = e.target.closest('.skill-badge');
        if (!b) return;
        b.classList.toggle('active');
        updateMeter();
    });

    document.getElementById('resetSkills').addEventListener('click', () => {
        document.querySelectorAll('.skill-badge.active').forEach(n => n.classList.remove('active'));
        updateMeter();
    });

    document.getElementById('generateBadge').addEventListener('click', () => {
        generateBadge(meterPct.textContent);
    });

    function updateMeter() {
        const active = [...document.querySelectorAll('.skill-badge.active')];
        const totalWeight = [...document.querySelectorAll('.skill-badge')].reduce((acc, el) => acc + Number(el.dataset.weight), 0);
        const activeWeight = active.reduce((acc, el) => acc + Number(el.dataset.weight), 0);
        const pct = Math.round((activeWeight / totalWeight) * 100);
        meterFill.style.width = pct + '%';
        meterPct.textContent = pct + '% Match';
    }
}

/* -----------------------------------
   Small meters on profile card
   ----------------------------------- */
function animateMiniMeters() {
    const fills = document.querySelectorAll('.skill-meter-mini .fill');
    // if present, animate
    document.querySelectorAll('.skill-meter-mini').forEach((el, idx) => {
        const fill = el.querySelector('.fill') || null;
        if (fill) {
            const pct = Number(fill.dataset.value) || (70 + idx * 8);
            setTimeout(() => fill.style.width = pct + '%', 300 + idx * 200);
        }
    });
}

/* -----------------------------------
   Projects & Demo modal
   includes tic-tac-toe and rps demo logic
   ----------------------------------- */
function initProjectDemos() {
    document.querySelectorAll('[data-open]').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = e.currentTarget.dataset.open;
            openDemo(id);
        });
    });

    // Download resume: simple text file from details on page
    document.getElementById('downloadResume').addEventListener('click', (e) => {
        const text = [
            'Ashish Kumar Shatapathy',
            'Frontend Developer',
            'Email: ashish.shatapathy01@gmail.com',
            'Phone: 07735818985',
            'Location: Bhadrak, India',
            '',
            'Projects: Tic-Tac-Toe, Stone-Paper-Scissor, Weather Dashboard',
            'Education: MCA (2023-2025), BCom (2018-2021)',
            'Skills: HTML, CSS, JavaScript, React, Bootstrap, MySQL, Git, SpringBoot'
        ].join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'Ashish_Shatapathy_Resume.txt'; a.click();
        URL.revokeObjectURL(url);
    });
}

function openDemo(id) {
    const modal = document.getElementById('demoModal');
    const content = document.getElementById('demoContent');
    content.innerHTML = ''; // reset

    if (id === 'tictactoe') {
        content.innerHTML = ticTacToeHTML();
        attachTicTacToe();
    } else if (id === 'rps') {
        content.innerHTML = rpsHTML();
        attachRPS();
    } else if (id === 'weather') {
        content.innerHTML = weatherHTML();
        // attachWeather could implement API later
    }

    modal.classList.add('open');
}

function initModalHandlers() {
    document.getElementById('closeDemo').addEventListener('click', () => {
        document.getElementById('demoModal').classList.remove('open');
    });
    // close modal on Esc
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.getElementById('demoModal').classList.remove('open'); });
}

/* Tic-Tac-Toe markup & logic */
function ticTacToeHTML() {
    return `
    <h3>Tic-Tac-Toe — Play</h3>
    <div class="muted">X starts. Click squares to play. Reset keeps local score.</div>
    <div style="height:12px"></div>
    <div id="ttStatus" class="muted">Turn: X</div>
    <div style="display:grid;grid-template-columns:repeat(3,80px);gap:6px;margin-top:10px">
      ${Array.from({ length: 9 }).map((_, i) => `<button class="ttCell" data-i="${i}" style="width:80px;height:80px;border-radius:10px;border:1px solid rgba(255,255,255,0.04);background:transparent;font-size:28px"></button>`).join('')}
    </div>
    <div style="margin-top:12px;display:flex;gap:8px;align-items:center">
      <button id="ttReset" class="btn ghost small">Reset</button>
      <div id="ttResult" class="muted"></div>
    </div>
  `;
}

function attachTicTacToe() {
    const cells = Array.from(document.querySelectorAll('.ttCell'));
    const status = document.getElementById('ttStatus');
    const result = document.getElementById('ttResult');
    let board = Array(9).fill('');
    let turn = 'X';

    function refresh() {
        cells.forEach((c, i) => c.textContent = board[i]);
        status.textContent = 'Turn: ' + turn;
    }
    function checkWin(p) {
        const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
        return lines.some(l => l.every(i => board[i] === p));
    }
    cells.forEach(c => c.onclick = () => {
        const i = Number(c.dataset.i);
        if (board[i]) return;
        board[i] = turn;
        if (checkWin(turn)) {
            result.textContent = turn + ' wins!';
            cells.forEach(x => x.onclick = null);
        } else if (board.every(Boolean)) {
            result.textContent = 'Draw';
        } else {
            turn = (turn === 'X' ? 'O' : 'X');
            refresh();
        }
    });

    document.getElementById('ttReset').onclick = () => {
        board = Array(9).fill(''); turn = 'X'; result.textContent = ''; refresh();
        // reattach click handlers
        cells.forEach(c => {
            c.onclick = () => {
                const i = Number(c.dataset.i);
                if (board[i]) return;
                board[i] = turn;
                if (checkWin(turn)) {
                    result.textContent = turn + ' wins!';
                    cells.forEach(x => x.onclick = null);
                } else if (board.every(Boolean)) {
                    result.textContent = 'Draw';
                } else {
                    turn = (turn === 'X' ? 'O' : 'X');
                    refresh();
                }
            };
        });
    };
}

/* RPS markup & logic */
function rpsHTML() {
    return `
    <h3>Stone-Paper-Scissor</h3>
    <div class="muted">Choose your move. AI picks randomly.</div>
    <div style="height:10px"></div>
    <div style="display:flex;gap:8px">
      <button class="rpsBtn btn ghost small" data-m="rock">Rock</button>
      <button class="rpsBtn btn ghost small" data-m="paper">Paper</button>
      <button class="rpsBtn btn ghost small" data-m="scissors">Scissors</button>
    </div>
    <div style="height:12px"></div>
    <div id="rpsResult" class="muted">Make your move</div>
  `;
}

function attachRPS() {
    document.querySelectorAll('.rpsBtn').forEach(b => {
        b.addEventListener('click', () => {
            const user = b.dataset.m;
            const opts = ['rock', 'paper', 'scissors'];
            const ai = opts[Math.floor(Math.random() * 3)];
            const res = rpsResult(user, ai);
            document.getElementById('rpsResult').textContent = `You: ${user} • AI: ${ai} → ${res}`;
        });
    });
}

function rpsResult(a, b) {
    if (a === b) return 'Draw';
    if ((a === 'rock' && b === 'scissors') || (a === 'scissors' && b === 'paper') || (a === 'paper' && b === 'rock')) return 'You Win';
    return 'You Lose';
}

/* Weather demo markup (placeholder) */
function weatherHTML() {
    return `
    <h3>Weather Dashboard (Demo)</h3>
    <div class="muted">This demo uses placeholder data. To enable live data, add your OpenWeatherMap API key in script.js where indicated.</div>
    <div style="height:12px"></div>
    <div style="display:flex;gap:12px;align-items:center">
      <div style="padding:12px;border-radius:10px;background:rgba(255,255,255,0.02);min-width:120px;text-align:center">
        <div style="font-size:28px;font-weight:800">27°C</div>
        <div class="muted">Clear — Bhadrak</div>
      </div>
      <div style="flex:1">
        <div class="muted">Hourly (demo):</div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:8px">Now: 27°C</div>
          <div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:8px">+3h: 25°C</div>
          <div style="padding:8px;background:rgba(255,255,255,0.02);border-radius:8px">+6h: 22°C</div>
        </div>
      </div>
    </div>
  `;
}

/* -----------------------------------
   Contact form — EmailJS integration
   ----------------------------------- */
function initContactForm() {
    // Initialize EmailJS - add your user ID here
    // 1) Create an account at https://www.emailjs.com/
    // 2) Create an email service and email template with variables: from_name, from_email, message
    // 3) Replace 'YOUR_USER_ID', 'YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID' below with your values
    try {
        emailjs.init('YOUR_USER_ID'); // <-- REPLACE WITH YOUR USER ID
    } catch (err) {
        // EmailJS may be unavailable until replaced
        console.warn('EmailJS init not configured. Replace YOUR_USER_ID in script.js to enable form.');
    }

    const form = document.getElementById('contactForm');
    const status = document.getElementById('contactStatus');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        status.textContent = 'Sending...';

        // EmailJS send:
        // Replace the below with your service + template IDs
        const serviceID = 'YOUR_SERVICE_ID';   // <-- replace
        const templateID = 'YOUR_TEMPLATE_ID'; // <-- replace
        const data = {
            from_name: form.from_name.value,
            from_email: form.from_email.value,
            message: form.message.value
        };

        if (emailjs && emailjs.send) {
            emailjs.send(serviceID, templateID, data)
                .then(() => {
                    status.textContent = 'Message sent — thanks!';
                    form.reset();
                }, (err) => {
                    console.error(err);
                    status.textContent = 'Failed to send. Check console or configure EmailJS.';
                });
        } else {
            // Fallback: open mailto with prefilled content
            status.textContent = 'EmailJS not configured. Opening mail client as fallback...';
            const mailto = `mailto:ashish.shatapathy01@gmail.com?subject=Portfolio%20Contact%20from%20${encodeURIComponent(data.from_name)}&body=${encodeURIComponent(data.message + '\n\nFrom: ' + data.from_email)}`;
            window.location.href = mailto;
        }
    });

    document.getElementById('clearForm').addEventListener('click', () => {
        form.reset(); status.textContent = '';
    });
}

/* -----------------------------------
   Hire / Resume buttons
   ----------------------------------- */
function initHeaderButtons() {
    document.getElementById('btnHire').addEventListener('click', () => {
        // opens contact section smoothly
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = document.querySelector('#contactForm input[name="from_name"]');
        if (input) input.focus();
    });
}

/* -----------------------------------
   Badge generator — creates PNG via canvas
   ----------------------------------- */
function generateBadge(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 220;
    const ctx = canvas.getContext('2d');

    // gradient background
    const g = ctx.createLinearGradient(0, 0, canvas.width, 0);
    g.addColorStop(0, '#7c3aed'); g.addColorStop(1, '#06b6d4');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // name
    ctx.fillStyle = '#001021';
    ctx.font = '22px Inter, sans-serif';
    ctx.fillText('Ashish K. Shatapathy', 24, 48);

    // score (text param like "72% Match")
    ctx.font = '48px Inter, sans-serif';
    ctx.fillText(text, 24, 120);

    // download
    const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = 'hire-badge.png'; a.click();
}

/* -----------------------------------
   Bouncing ball game — continuous demo
   ----------------------------------- */
function initGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return; // if not present, skip
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Ball properties
    let ball = {
        x: w / 2,
        y: h / 2,
        vx: 3 + Math.random() * 2,
        vy: 3 + Math.random() * 2,
        radius: 15,
        color: '#7c3aed'
    };

    // Trails array
    const trails = [];
    const maxTrails = 20;

    function update() {
        // Move ball
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Bounce off walls
        if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= w) {
            ball.vx = -ball.vx;
            ball.x = Math.max(ball.radius, Math.min(w - ball.radius, ball.x));
        }
        if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= h) {
            ball.vy = -ball.vy;
            ball.y = Math.max(ball.radius, Math.min(h - ball.radius, ball.y));
        }

        // Add trail
        trails.push({ x: ball.x, y: ball.y, alpha: 1 });
        if (trails.length > maxTrails) trails.shift();

        // Fade trails
        trails.forEach(t => t.alpha -= 0.05);
        trails.splice(0, trails.findIndex(t => t.alpha <= 0));
    }

    function draw() {
        // Clear with slight fade for trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, w, h);

        // Draw trails
        trails.forEach(t => {
            ctx.save();
            ctx.globalAlpha = t.alpha;
            ctx.fillStyle = ball.color;
            ctx.beginPath();
            ctx.arc(t.x, t.y, ball.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Draw ball with glow
        const grd = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius * 2);
        grd.addColorStop(0, ball.color);
        grd.addColorStop(1, 'rgba(124, 58, 237, 0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    loop();
}

/* -----------------------------------
   End of file
   ----------------------------------- */
