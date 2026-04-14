// ─── SLIME BACKGROUND ────────────────────────────────────────────────────────
(function () {
  const canvas = document.getElementById('bgCanvas');
  const ctx    = canvas.getContext('2d');

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#50d23c','#64e632','#3cbe50','#82dc28','#32aa46','#78e050'];
  function rnd() { return COLORS[Math.floor(Math.random() * COLORS.length)]; }

  function makeDrip(rndLen) {
    return { x: 30 + Math.random() * (canvas.width - 60), topY: 0,
      length: rndLen ? Math.random() * 80 : 8,
      maxLength: 50 + Math.random() * 130, width: 12 + Math.random() * 24,
      growSpeed: 0.25 + Math.random() * 0.5, phase: 'grow', fallVY: 0,
      alpha: 0.25 + Math.random() * 0.25, color: rnd(), wobble: Math.random() * Math.PI * 2 };
  }
  function makeBlob(on) {
    const s = Math.random() < 0.5 ? -1 : 1;
    return { x: on ? Math.random() * canvas.width : (s < 0 ? -100 : canvas.width + 100),
      y: 60 + Math.random() * Math.max(1, canvas.height - 120),
      r: 30 + Math.random() * 60, vx: s * (0.2 + Math.random() * 0.3),
      vy: (Math.random() - 0.5) * 0.15, t: Math.random() * Math.PI * 2,
      speed: 0.015 + Math.random() * 0.02, alpha: 0.18 + Math.random() * 0.18,
      color: rnd(), numPts: 7 + Math.floor(Math.random() * 4) };
  }
  function makeBubble(on) {
    return { x: Math.random() * canvas.width,
      y: on ? Math.random() * canvas.height : canvas.height + 20,
      r: 5 + Math.random() * 18, vy: -(0.4 + Math.random() * 0.6),
      vx: (Math.random() - 0.5) * 0.4, alpha: 0.2 + Math.random() * 0.2,
      color: rnd(), wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03 };
  }

  let drips   = Array.from({ length: 14 }, () => makeDrip(true));
  let blobs   = Array.from({ length: 8  }, () => makeBlob(true));
  let bubbles = Array.from({ length: 12 }, () => makeBubble(true));

  function drawBlob(b) {
    ctx.save(); ctx.globalAlpha = b.alpha; ctx.fillStyle = b.color; ctx.beginPath();
    for (let i = 0; i <= b.numPts; i++) {
      const a = (i / b.numPts) * Math.PI * 2;
      const w = 1 + 0.28 * Math.sin(b.t * 2 + i * 2.3) + 0.14 * Math.cos(b.t * 3 + i * 1.4);
      const px = b.x + Math.cos(a) * b.r * w, py = b.y + Math.sin(a) * b.r * w * 0.8;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function drawDrip(d) {
    const sw = Math.sin(d.wobble) * d.width * 0.12;
    ctx.save(); ctx.globalAlpha = d.alpha; ctx.fillStyle = d.color; ctx.beginPath();
    ctx.moveTo(d.x - d.width / 2 + sw, d.topY);
    ctx.bezierCurveTo(d.x - d.width / 2 + sw, d.topY + d.length * 0.35, d.x - d.width * 0.6 + sw, d.topY + d.length * 0.72, d.x + sw, d.topY + d.length);
    ctx.bezierCurveTo(d.x + d.width * 0.6 + sw, d.topY + d.length * 0.72, d.x + d.width / 2 + sw, d.topY + d.length * 0.35, d.x + d.width / 2 + sw, d.topY);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function drawBubble(b) {
    ctx.save(); ctx.globalAlpha = b.alpha; ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    blobs.forEach((b, i) => {
      b.t += b.speed; b.x += b.vx; b.y += b.vy;
      if ((b.vx > 0 && b.x > canvas.width + 120) || (b.vx < 0 && b.x < -120)) blobs[i] = makeBlob(false);
      drawBlob(b);
    });
    drips.forEach((d, i) => {
      d.wobble += 0.02;
      if (d.phase === 'grow') { d.length += d.growSpeed; if (d.length >= d.maxLength) d.phase = 'fall'; }
      else { d.fallVY += 0.15; d.topY += d.fallVY; if (d.topY > canvas.height + 80) drips[i] = makeDrip(false); }
      drawDrip(d);
    });
    bubbles.forEach((b, i) => {
      b.wobble += b.wobbleSpeed; b.x += b.vx + Math.sin(b.wobble) * 0.3; b.y += b.vy;
      if (b.y < -40) bubbles[i] = makeBubble(false);
      drawBubble(b);
    });
    requestAnimationFrame(animate);
  }
  animate();
})();

// ─── APP STATE ────────────────────────────────────────────────────────────────
let providers        = {};   // { openai: [...models], anthropic: [...], google: [...] }
let currentExperiment = null;
let history          = [];
let historyOpen      = false;

const PROVIDER_LABELS = { openai: 'OpenAI', anthropic: 'Anthropic', google: 'Google' };
const PROVIDER_ICONS  = { openai: '🟢', anthropic: '🟣', google: '🔵' };

// ─── INIT: fetch available providers from server ───────────────────────────────
async function init() {
  try {
    const res  = await fetch('/api/providers');
    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Could not load provider configuration from server.');
      renderProviderChips({});
      return;
    }

    providers = data;
    renderProviderChips(data);
    buildProviderDropdown(data);
    document.getElementById('keyNote').style.display = 'block';
  } catch (e) {
    showError('Cannot reach the server. Make sure node server.js is running.');
    renderProviderChips({});
  }
}

function renderProviderChips(data) {
  const allProviders = ['openai', 'anthropic', 'google'];
  const chips = document.getElementById('providerChips');
  chips.innerHTML = allProviders.map(p => {
    const ok = !!data[p];
    return `<span class="provider-chip ${ok ? 'chip-ok' : 'chip-none'}">
      ${PROVIDER_ICONS[p]} ${PROVIDER_LABELS[p]}${ok ? ' ✓' : ' — no key'}
    </span>`;
  }).join('');
}

function buildProviderDropdown(data) {
  const sel = document.getElementById('providerSelect');
  const keys = Object.keys(data);
  if (keys.length === 0) {
    sel.innerHTML = '<option value="">No providers configured</option>';
    return;
  }
  sel.innerHTML = keys.map(p =>
    `<option value="${p}">${PROVIDER_ICONS[p]} ${PROVIDER_LABELS[p]}</option>`
  ).join('');
  onProviderChange();
}

function onProviderChange() {
  const provider = document.getElementById('providerSelect').value;
  const modelSel = document.getElementById('modelSelect');
  const models   = providers[provider] || [];
  modelSel.innerHTML = models.map(m => `<option value="${m}">${m}</option>`).join('');
}

// ─── GENERATE ─────────────────────────────────────────────────────────────────
async function generateExperiment() {
  const provider = document.getElementById('providerSelect').value;
  const model    = document.getElementById('modelSelect').value;
  const grade    = document.getElementById('gradeSelect').value;
  const supplies = document.getElementById('suppliesInput').value.trim();

  if (!provider || !model) { showError('Please select a provider and model.'); return; }
  if (!supplies)           { showError('Please list at least one supply.'); return; }

  clearError();
  setLoading(true);
  document.getElementById('outputSection').style.display = 'none';

  try {
    const res  = await fetch('/api/generate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ provider, model, grade, supplies }),
    });
    const data = await res.json();

    if (!res.ok) {
      showError(data.error || `Server error ${res.status}.`);
      return;
    }

    currentExperiment = { markdown: data.result, grade, provider, model,
                          timestamp: new Date().toLocaleTimeString() };
    renderExperiment(currentExperiment);
    addToHistory(currentExperiment);
  } catch (e) {
    showError('Could not reach the server. Is node server.js running?');
  } finally {
    setLoading(false);
  }
}

function setLoading(on) {
  const btn     = document.getElementById('generateBtn');
  const spinner = document.getElementById('loadingSpinner');
  btn.disabled                = on;
  spinner.style.display       = on ? 'block' : 'none';
  btn.querySelector('.btn-label').textContent = on ? 'Generating…' : '🔬 Generate Experiment';
}

// ─── RENDER ───────────────────────────────────────────────────────────────────
function renderExperiment(exp) {
  document.getElementById('outputSection').style.display = 'block';
  document.getElementById('outputContent').innerHTML = marked.parse(exp.markdown);
  document.getElementById('gradeChip').textContent  = exp.grade;
  document.getElementById('modelChip').textContent  = `${PROVIDER_LABELS[exp.provider] || exp.provider} · ${exp.model}`;

  // Difficulty badge — simple heuristic from text
  const badge = document.getElementById('difficultyBadge');
  const text  = exp.markdown.toLowerCase();
  if (/advanced|complex|challenging|difficult|9.12|high school/.test(text)) {
    badge.className = 'difficulty-badge badge-hard'; badge.textContent = '🔴 Hard';
  } else if (/intermediate|moderate|6.8|middle school/.test(text)) {
    badge.className = 'difficulty-badge badge-medium'; badge.textContent = '🟡 Medium';
  } else {
    badge.className = 'difficulty-badge badge-easy'; badge.textContent = '🟢 Easy';
  }
}

// ─── HISTORY ──────────────────────────────────────────────────────────────────
function addToHistory(exp) {
  history.unshift({ ...exp });
  renderHistory();
}

function renderHistory() {
  const grid  = document.getElementById('historyGrid');
  const empty = document.getElementById('historyEmpty');
  const badge = document.getElementById('historyCount');
  badge.textContent = history.length > 0 ? `(${history.length})` : '';
  if (history.length === 0) { empty.style.display = 'block'; grid.innerHTML = ''; return; }
  empty.style.display = 'none';
  grid.innerHTML = history.map((e, i) => `
    <div class="history-card" onclick="loadHistory(${i})">
      <div class="history-card-title">${escHtml(extractTitle(e.markdown))}</div>
      <div class="history-card-meta">${escHtml(e.grade)} · ${escHtml(PROVIDER_LABELS[e.provider] || e.provider)} · ${e.timestamp}</div>
    </div>`).join('');
}

function loadHistory(i) {
  currentExperiment = history[i];
  clearError();
  renderExperiment(history[i]);
  document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
}

function toggleHistory() {
  historyOpen = !historyOpen;
  document.getElementById('historyBody').classList.toggle('open', historyOpen);
  document.getElementById('historyChevron').classList.toggle('open', historyOpen);
}

// ─── DOWNLOAD ─────────────────────────────────────────────────────────────────
function downloadTxt() {
  if (!currentExperiment) return;
  dl(new Blob([currentExperiment.markdown], { type: 'text/plain' }),
     safe(extractTitle(currentExperiment.markdown)) + '.txt');
}

function downloadHtml() {
  if (!currentExperiment) return;
  const body = marked.parse(currentExperiment.markdown);
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>${escHtml(extractTitle(currentExperiment.markdown))}</title>
<style>body{font-family:Arial,sans-serif;max-width:760px;margin:40px auto;padding:24px;color:#243d24;}
h1{color:#2d4a2d;border-bottom:3px solid #4a7a4a;padding-bottom:8px;}
h2{color:#4a7a4a;margin-top:20px;}ul,ol{padding-left:22px;}li{margin-bottom:4px;}p{line-height:1.7;}</style>
</head><body><p style="color:#6b9b6b;font-size:.85rem;">Grade: ${escHtml(currentExperiment.grade)} · Model: ${escHtml(currentExperiment.model)}</p>
${body}</body></html>`;
  dl(new Blob([html], { type: 'text/html' }), safe(extractTitle(currentExperiment.markdown)) + '.html');
}

function dl(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── PRINT WORKSHEET ──────────────────────────────────────────────────────────
function printWorksheet() {
  if (!currentExperiment) return;
  const tmp = document.createElement('div');
  tmp.innerHTML = marked.parse(currentExperiment.markdown);

  const title = tmp.querySelector('h1')?.textContent || extractTitle(currentExperiment.markdown);
  let materials = [], steps = [];

  tmp.querySelectorAll('h1,h2,h3').forEach(h => {
    const t = h.textContent.toLowerCase();
    const isMat  = /material|supplies/.test(t);
    const isStep = /instruction|step|procedure/.test(t);
    if (!isMat && !isStep) return;
    let el = h.nextElementSibling;
    while (el && !['H1','H2','H3'].includes(el.tagName)) {
      if (['UL','OL'].includes(el.tagName)) {
        const items = [...el.querySelectorAll('li')].map(li => li.textContent.trim());
        if (isMat) materials = items; else steps = items;
        break;
      }
      el = el.nextElementSibling;
    }
  });

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${escHtml(title)} — Worksheet</title>
<style>body{font-family:Arial,sans-serif;max-width:750px;margin:30px auto;padding:24px;color:#333;}
h1{font-size:1.4rem;border-bottom:3px solid #4a7a4a;padding-bottom:8px;color:#2d4a2d;}
h2{color:#4a7a4a;margin-top:22px;font-size:1rem;text-transform:uppercase;letter-spacing:1px;}
.meta{color:#6b9b6b;font-size:.85rem;margin-bottom:16px;}
.nd{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:18px;}
.fl{border:none;border-bottom:2px solid #4a7a4a;display:block;height:26px;width:100%;margin-bottom:14px;}
.fl-lbl{font-size:.75rem;color:#6b9b6b;text-transform:uppercase;letter-spacing:1px;}
ul.ck{list-style:none;padding:0;}ul.ck li{padding:5px 0;border-bottom:1px solid #eee;}
ul.ck li::before{content:"☐ ";font-size:1.1rem;}
ol.st{list-style:none;padding:0;counter-reset:s;}
ol.st li{counter-increment:s;padding-left:32px;position:relative;margin-bottom:14px;}
ol.st li::before{content:counter(s);position:absolute;left:0;top:2px;background:#4a7a4a;color:#fff;width:22px;height:22px;border-radius:50%;text-align:center;line-height:22px;font-size:.8rem;font-weight:700;}
.nl{border:none;border-bottom:1px dashed #ccc;display:block;margin-top:5px;height:22px;}
table{width:100%;border-collapse:collapse;margin-top:10px;}th,td{border:1px solid #ccc;padding:10px;}
th{background:#eef5e8;color:#2d4a2d;font-size:.85rem;}td{height:38px;}
.pbtn{padding:9px 22px;background:#4a7a4a;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:.95rem;font-weight:700;margin:16px 0;}
@media print{.pbtn{display:none;}body{margin:10px;}}</style></head><body>
<button class="pbtn" onclick="window.print()">🖨️ Print</button>
<h1>🔬 ${escHtml(title)}</h1>
<p class="meta">Worksheet · Grade: ${escHtml(currentExperiment.grade)} · Model: ${escHtml(currentExperiment.model)}</p>
<div class="nd"><div><div class="fl-lbl">Student Name</div><span class="fl"></span></div>
<div><div class="fl-lbl">Date</div><span class="fl"></span></div></div>
<h2>📋 Materials Checklist</h2>
<ul class="ck">${(materials.length ? materials : ['See experiment']).map(m => `<li>${escHtml(m)}</li>`).join('')}</ul>
<h2>📝 Steps</h2>
<ol class="st">${(steps.length ? steps : ['Follow the experiment steps']).map(s => `<li>${escHtml(s)}<span class="nl"></span></li>`).join('')}</ol>
<h2>📊 Observations</h2>
<table><tr><th>#</th><th>What I Noticed</th></tr>
<tr><td>1</td><td></td></tr><tr><td>2</td><td></td></tr>
<tr><td>3</td><td></td></tr><tr><td>Conclusion</td><td></td></tr></table>
<button class="pbtn" onclick="window.print()">🖨️ Print</button></body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 400);
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function extractTitle(md) {
  return (md.match(/^#\s+(.+)/m)?.[1] || 'Science Experiment').trim();
}
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function safe(s) {
  return s.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 60) || 'experiment';
}
function showError(msg) {
  const p = document.getElementById('errorPanel');
  p.textContent = msg; p.classList.add('show');
}
function clearError() {
  const p = document.getElementById('errorPanel');
  p.textContent = ''; p.classList.remove('show');
}

window.addEventListener('DOMContentLoaded', init);
