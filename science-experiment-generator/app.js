// ─── BACKGROUND ANIMATION (slime drips + blobs) ─────────────────────────────
(function () {
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Slime color palette — translucent greens
  const SLIME_COLORS = [
    'rgba(80, 210, 60, ',
    'rgba(100, 230, 50, ',
    'rgba(60, 190, 80, ',
    'rgba(130, 220, 40, ',
    'rgba(50, 170, 70, ',
  ];

  function rndColor(alpha) {
    return SLIME_COLORS[Math.floor(Math.random() * SLIME_COLORS.length)] + alpha + ')';
  }

  // ── DRIPS: hang from top edge, grow downward, then fall ──────────────────
  function makeDrip() {
    return {
      x: Math.random() * canvas.width,
      topY: 0,
      length: 20 + Math.random() * 40,        // current drawn length
      maxLength: 60 + Math.random() * 120,     // how long before it falls
      width: 8 + Math.random() * 18,
      growSpeed: 0.18 + Math.random() * 0.35,
      falling: false,
      fallVY: 0,
      opacity: 0.13 + Math.random() * 0.14,
      color: rndColor(0.14),
      phase: 'grow',                           // grow → drip → fall
      wobble: Math.random() * Math.PI * 2,
    };
  }

  // ── BLOBS: wobbly circles drifting slowly across the screen ──────────────
  function makeBlob() {
    const side = Math.random() < 0.5 ? -1 : 1;
    return {
      x: side === -1 ? -80 : canvas.width + 80,
      y: 80 + Math.random() * (canvas.height - 160),
      r: 22 + Math.random() * 45,
      vx: side * (0.15 + Math.random() * 0.25),
      vy: (Math.random() - 0.5) * 0.12,
      t: Math.random() * Math.PI * 2,
      speed: 0.012 + Math.random() * 0.018,
      opacity: 0.07 + Math.random() * 0.1,
      color: rndColor(0.09),
      numPts: 7 + Math.floor(Math.random() * 4),
    };
  }

  // ── BUBBLES: small circles rising from the bottom ────────────────────────
  function makeBubble() {
    return {
      x: Math.random() * canvas.width,
      y: canvas.height + 20,
      r: 4 + Math.random() * 14,
      vy: -(0.3 + Math.random() * 0.5),
      vx: (Math.random() - 0.5) * 0.3,
      opacity: 0.08 + Math.random() * 0.1,
      color: rndColor(0.09),
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
    };
  }

  let drips    = Array.from({ length: 12 }, makeDrip);
  let blobs    = Array.from({ length: 7  }, makeBlob);
  let bubbles  = Array.from({ length: 10 }, makeBubble);

  // ── Draw an organic blob shape ────────────────────────────────────────────
  function drawBlob(b) {
    ctx.save();
    ctx.globalAlpha = b.opacity;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    const pts = b.numPts;
    for (let i = 0; i <= pts; i++) {
      const angle = (i / pts) * Math.PI * 2;
      const wobble = 1 + 0.22 * Math.sin(b.t * 1.8 + i * 2.1)
                       + 0.12 * Math.cos(b.t * 2.7 + i * 1.3);
      const px = b.x + Math.cos(angle) * b.r * wobble;
      const py = b.y + Math.sin(angle) * b.r * wobble * 0.75; // slightly squished
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ── Draw a slime drip teardrop ────────────────────────────────────────────
  function drawDrip(d) {
    const { x, topY, length, width, wobble } = d;
    const wx = Math.sin(wobble) * (width * 0.15); // slight sway

    ctx.save();
    ctx.globalAlpha = d.opacity;
    ctx.fillStyle = d.color;
    ctx.beginPath();
    // Top flat edge (attached to ceiling or falling)
    ctx.moveTo(x - width / 2 + wx, topY);
    // Left side curve down to rounded tip
    ctx.bezierCurveTo(
      x - width / 2 + wx, topY + length * 0.35,
      x - width * 0.55 + wx, topY + length * 0.7,
      x + wx, topY + length
    );
    // Right side back up
    ctx.bezierCurveTo(
      x + width * 0.55 + wx, topY + length * 0.7,
      x + width / 2 + wx, topY + length * 0.35,
      x + width / 2 + wx, topY
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ── Draw a bubble (circle with slight highlight) ──────────────────────────
  function drawBubble(b) {
    ctx.save();
    ctx.globalAlpha = b.opacity;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  let frame = 0;

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    // ── Blobs ──
    blobs.forEach((b, i) => {
      b.t += b.speed;
      b.x += b.vx;
      b.y += b.vy;
      // Respawn when off screen
      if ((b.vx > 0 && b.x > canvas.width + 100) ||
          (b.vx < 0 && b.x < -100)) {
        blobs[i] = makeBlob();
      }
      drawBlob(b);
    });

    // ── Drips ──
    drips.forEach((d, i) => {
      d.wobble += 0.025;
      if (d.phase === 'grow') {
        d.length += d.growSpeed;
        if (d.length >= d.maxLength) d.phase = 'fall';
      } else {
        // Fall
        d.fallVY += 0.12;
        d.topY += d.fallVY;
        if (d.topY > canvas.height + 60) drips[i] = makeDrip();
      }
      drawDrip(d);
    });

    // ── Bubbles ──
    bubbles.forEach((b, i) => {
      b.wobble += b.wobbleSpeed;
      b.x += b.vx + Math.sin(b.wobble) * 0.25;
      b.y += b.vy;
      if (b.y < -30) {
        bubbles[i] = makeBubble();
      }
      drawBubble(b);
    });

    requestAnimationFrame(animate);
  }
  animate();
})();

// ─── APP STATE ───────────────────────────────────────────────────────────────
let openaiKey = '';
let experimentHistory = [];   // SC1: session history
let currentExperiment = null; // { title, grade, markdown, timestamp }
let historyOpen = false;

// ─── COMMON SUPPLIES (SC2 / SC3) ─────────────────────────────────────────────
const COMMON_SUPPLIES = [
  { name: 'vinegar',      emoji: '🧪' },
  { name: 'baking soda',  emoji: '🥄' },
  { name: 'food coloring',emoji: '🎨' },
  { name: 'salt',         emoji: '🧂' },
  { name: 'sugar',        emoji: '🍬' },
  { name: 'balloons',     emoji: '🎈' },
  { name: 'string',       emoji: '🧵' },
  { name: 'paper clips',  emoji: '📎' },
  { name: 'rubber bands', emoji: '🔄' },
  { name: 'candles',      emoji: '🕯️' },
  { name: 'ice',          emoji: '🧊' },
  { name: 'cornstarch',   emoji: '🌽' },
  { name: 'dish soap',    emoji: '🧴' },
  { name: 'water',        emoji: '💧' },
  { name: 'eggs',         emoji: '🥚' },
  { name: 'lemon juice',  emoji: '🍋' },
  { name: 'milk',         emoji: '🥛' },
  { name: 'paper',        emoji: '📄' },
  { name: 'scissors',     emoji: '✂️' },
  { name: 'tape',         emoji: '🏷️' },
  { name: 'cotton balls', emoji: '🫧' },
  { name: 'aluminum foil',emoji: '✨' },
];

// ─── INIT ────────────────────────────────────────────────────────────────────
function init() {
  renderChips();
}

// ─── SUPPLY CHIPS (SC2 / SC3) ────────────────────────────────────────────────
function renderChips() {
  const grid = document.getElementById('chipsGrid');
  grid.innerHTML = COMMON_SUPPLIES.map(s => `
    <button class="supply-chip" onclick="addSupply('${s.name}', this)" title="Add ${s.name}">
      <span class="chip-emoji">${s.emoji}</span>
      ${s.name}
    </button>
  `).join('');
}

function addSupply(name, btn) {
  const ta = document.getElementById('suppliesInput');
  const current = ta.value.trim();
  // Avoid duplicates
  const lines = current ? current.split('\n').map(l => l.trim().toLowerCase()) : [];
  if (!lines.includes(name.toLowerCase())) {
    ta.value = current ? current + '\n' + name : name;
    btn.classList.add('added');
    setTimeout(() => btn.classList.remove('added'), 800);
  }
  ta.focus();
}

// ─── API KEY ─────────────────────────────────────────────────────────────────
function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const text = ev.target.result;
    const match = text.match(/OPENAI_API_KEY\s*[=,]\s*["']?([^\s"',\n]+)["']?/i);
    if (match) {
      openaiKey = match[1];
      document.getElementById('keyInput').value = openaiKey;
      showKeyIndicator();
    } else {
      alert('Could not find OPENAI_API_KEY in the file. Make sure it contains: OPENAI_API_KEY=sk-...');
    }
    // Reset file input
    e.target.value = '';
  };
  reader.readAsText(file);
}

function handleKeyInput() {
  const val = document.getElementById('keyInput').value.trim();
  openaiKey = val;
  if (val) showKeyIndicator(); else hideKeyIndicator();
}

function showKeyIndicator() {
  document.getElementById('keyIndicator').classList.add('loaded');
}
function hideKeyIndicator() {
  document.getElementById('keyIndicator').classList.remove('loaded');
}

function clearKey() {
  openaiKey = '';
  document.getElementById('keyInput').value = '';
  hideKeyIndicator();
}

// ─── API HELPERS ──────────────────────────────────────────────────────────────
async function callOpenAI(messages, maxTokens = 1500) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw { status: res.status, body };
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

function friendlyError(err) {
  if (err.status === 401) return '🔑 Invalid API key. Please check your OpenAI key and try again.';
  if (err.status === 429) return '⏳ Rate limit reached. Please wait a moment and try again.';
  if (err.status >= 500) return '🔧 OpenAI server error. Please try again in a moment.';
  if (!navigator.onLine) return '📡 No internet connection. Please check your network.';
  return `⚠️ Request failed (${err.status || 'unknown'}). Please try again.`;
}

function showError(msg) {
  const panel = document.getElementById('errorPanel');
  panel.textContent = msg;
  panel.classList.add('show');
}

function clearError() {
  const panel = document.getElementById('errorPanel');
  panel.textContent = '';
  panel.classList.remove('show');
}

// ─── GENERATE EXPERIMENT ──────────────────────────────────────────────────────
async function generateExperiment() {
  if (!openaiKey) {
    showError('🔑 Please enter your OpenAI API key first.');
    return;
  }

  const grade = document.getElementById('gradeSelect').value;
  const supplies = document.getElementById('suppliesInput').value.trim();

  if (!supplies) {
    showError('🧪 Please list at least one supply in the supplies field.');
    return;
  }

  clearError();
  setGenerating(true);
  hideOutput();
  hideSubstitution();

  try {
    const markdown = await callOpenAI([
      {
        role: 'system',
        content:
          'You are a K-12 science education assistant. Generate engaging, safe, hands-on science experiments appropriate for the specified grade level using only the listed supplies. Format your response in clear markdown with sections for: title (as H1), learning objectives (as H2), materials needed (as H2 with a bulleted list), step-by-step instructions (as H2 with a numbered list), expected results (as H2), and scientific explanation (as H2).',
      },
      {
        role: 'user',
        content: `Grade Level: ${grade}\nAvailable Supplies: ${supplies}\nGenerate a science experiment.`,
      },
    ]);

    const title = extractTitle(markdown);
    currentExperiment = { title, grade, markdown, timestamp: new Date().toLocaleTimeString() };

    renderExperiment(markdown, grade);
    addToHistory(currentExperiment);

    // SC6: Get difficulty rating in parallel (non-blocking)
    getDifficultyRating(markdown);
  } catch (err) {
    showError(friendlyError(err));
  } finally {
    setGenerating(false);
  }
}

function setGenerating(loading) {
  const btn = document.getElementById('generateBtn');
  const spinner = document.getElementById('loadingSpinner');
  btn.disabled = loading;
  spinner.style.display = loading ? 'block' : 'none';
  btn.querySelector('.btn-label').textContent = loading ? 'Generating…' : '🔬 Generate Experiment';
}

function extractTitle(markdown) {
  const match = markdown.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : 'Science Experiment';
}

// ─── RENDER EXPERIMENT ───────────────────────────────────────────────────────
function renderExperiment(markdown, grade) {
  const outputSection = document.getElementById('outputSection');
  const outputContent = document.getElementById('outputContent');
  const gradeChip = document.getElementById('gradeChip');

  outputSection.style.display = 'block';
  outputContent.innerHTML = marked.parse(markdown);
  gradeChip.textContent = grade;

  // SC4: Make materials list items clickable
  makeMaterialsClickable(outputContent);
}

function hideOutput() {
  document.getElementById('outputSection').style.display = 'none';
  document.getElementById('difficultyBadge').className = 'difficulty-badge';
  document.getElementById('difficultyBadge').textContent = '';
}

// ─── SC4: CLICKABLE MATERIALS ────────────────────────────────────────────────
function makeMaterialsClickable(container) {
  const headings = container.querySelectorAll('h1, h2, h3, h4');
  let materialsHeading = null;

  for (const h of headings) {
    if (/material|supplies/i.test(h.textContent)) {
      materialsHeading = h;
      break;
    }
  }
  if (!materialsHeading) return;

  let el = materialsHeading.nextElementSibling;
  while (el) {
    if (['H1', 'H2', 'H3', 'H4'].includes(el.tagName)) break;
    if (['UL', 'OL'].includes(el.tagName)) {
      el.querySelectorAll('li').forEach(li => {
        li.classList.add('clickable-material');
        li.title = 'Click to find substitutes';
        li.addEventListener('click', () => {
          const name = li.textContent.replace(/🔄$/, '').trim();
          requestSubstitute(name);
        });
      });
      break;
    }
    el = el.nextElementSibling;
  }
}

// ─── SC4: SUBSTITUTION API CALL ───────────────────────────────────────────────
async function requestSubstitute(material) {
  showSubstitution(material);

  try {
    const response = await callOpenAI(
      [
        {
          role: 'user',
          content: `Suggest 2-3 common household substitutes for "${material}" in a science experiment for K-12 students. For each substitute, give its name and one sentence on how to use it. Keep it brief and practical.`,
        },
      ],
      250
    );
    renderSubstitute(material, response);
  } catch (err) {
    renderSubstitute(material, null, friendlyError(err));
  }
}

function showSubstitution(material) {
  const sec = document.getElementById('substitutionSection');
  const body = document.getElementById('substitutionBody');
  sec.style.display = 'block';
  document.getElementById('substitutionMaterial').textContent = material;
  body.innerHTML = `<div class="sub-spinner"><div class="mini-spinner"></div> Finding substitutes for <strong>${material}</strong>…</div>`;
}

function renderSubstitute(material, text, error) {
  const body = document.getElementById('substitutionBody');
  if (error) {
    body.innerHTML = `<div class="sub-text" style="color:var(--red);">${error}</div>`;
    return;
  }
  body.innerHTML = `
    <div class="substitute-item">
      <div class="sub-material-name">Substitutes for: ${material}</div>
      <div class="sub-text">${text.replace(/\n/g, '<br>')}</div>
    </div>`;
}

function hideSubstitution() {
  document.getElementById('substitutionSection').style.display = 'none';
}

// ─── SC6: DIFFICULTY RATING ───────────────────────────────────────────────────
async function getDifficultyRating(markdown) {
  const badge = document.getElementById('difficultyBadge');
  badge.className = 'difficulty-badge badge-loading';
  badge.textContent = '⏳ Rating…';

  try {
    const result = await callOpenAI(
      [
        {
          role: 'user',
          content: `Rate this science experiment as Easy, Medium, or Hard based on the complexity of the steps and required materials. Respond with ONLY one word: Easy, Medium, or Hard.\n\n${markdown}`,
        },
      ],
      5
    );
    const rating = result.trim().toLowerCase();
    if (rating.includes('easy')) {
      badge.className = 'difficulty-badge badge-easy';
      badge.textContent = '🟢 Easy';
    } else if (rating.includes('medium')) {
      badge.className = 'difficulty-badge badge-medium';
      badge.textContent = '🟡 Medium';
    } else if (rating.includes('hard')) {
      badge.className = 'difficulty-badge badge-hard';
      badge.textContent = '🔴 Hard';
    } else {
      badge.className = 'difficulty-badge';
      badge.textContent = '';
    }
  } catch (_) {
    badge.className = 'difficulty-badge';
    badge.textContent = '';
  }
}

// ─── SC1: HISTORY ─────────────────────────────────────────────────────────────
function addToHistory(experiment) {
  experimentHistory.unshift({ ...experiment });
  renderHistory();
}

function renderHistory() {
  const grid = document.getElementById('historyGrid');
  const empty = document.getElementById('historyEmpty');
  const badge = document.getElementById('historyCount');

  badge.textContent = experimentHistory.length > 0 ? `(${experimentHistory.length})` : '';

  if (experimentHistory.length === 0) {
    empty.style.display = 'block';
    grid.innerHTML = '';
    return;
  }
  empty.style.display = 'none';
  grid.innerHTML = experimentHistory
    .map(
      (exp, i) => `
    <div class="history-card" onclick="loadFromHistory(${i})">
      <div class="history-card-title">${escapeHtml(exp.title)}</div>
      <div class="history-card-meta">${escapeHtml(exp.grade)} · ${exp.timestamp}</div>
    </div>`
    )
    .join('');
}

function loadFromHistory(index) {
  const exp = experimentHistory[index];
  if (!exp) return;
  currentExperiment = exp;
  clearError();
  hideSubstitution();
  renderExperiment(exp.markdown, exp.grade);
  // Re-fetch difficulty for the loaded experiment
  getDifficultyRating(exp.markdown);
  // Scroll to output
  document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
}

function toggleHistory() {
  historyOpen = !historyOpen;
  document.getElementById('historyBody').classList.toggle('open', historyOpen);
  document.getElementById('historyChevron').classList.toggle('open', historyOpen);
}

// ─── SC5: DOWNLOAD ────────────────────────────────────────────────────────────
function downloadTxt() {
  if (!currentExperiment) return;
  const blob = new Blob([currentExperiment.markdown], { type: 'text/plain' });
  triggerDownload(blob, safeFilename(currentExperiment.title) + '.txt');
}

function downloadHtml() {
  if (!currentExperiment) return;
  const html = buildStandaloneHtml(currentExperiment);
  const blob = new Blob([html], { type: 'text/html' });
  triggerDownload(blob, safeFilename(currentExperiment.title) + '.html');
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function safeFilename(title) {
  return title.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 60) || 'experiment';
}

function buildStandaloneHtml(exp) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(exp.title)}</title>
<style>
  body{font-family:Arial,sans-serif;max-width:760px;margin:40px auto;padding:24px;color:#243d24;background:#f8fbf6;}
  h1{font-size:1.5rem;color:#2d4a2d;border-bottom:3px solid #4a7a4a;padding-bottom:8px;margin-bottom:12px;}
  h2{font-size:1.1rem;color:#4a7a4a;margin-top:20px;margin-bottom:8px;}
  ul,ol{padding-left:22px;margin-bottom:10px;}
  li{margin-bottom:4px;}
  p{margin-bottom:10px;line-height:1.7;}
  .meta{font-size:0.85rem;color:#6b9b6b;margin-bottom:20px;}
</style>
</head>
<body>
<p class="meta">Grade: ${escapeHtml(exp.grade)} · Generated ${exp.timestamp}</p>
${marked.parse(exp.markdown)}
</body>
</html>`;
}

// ─── SC5: PRINT WORKSHEET ─────────────────────────────────────────────────────
function printWorksheet() {
  if (!currentExperiment) return;

  // Parse the rendered HTML to extract materials and steps
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = marked.parse(currentExperiment.markdown);

  const title = (tempDiv.querySelector('h1')?.textContent || currentExperiment.title).trim();
  const { materials, steps } = extractSections(tempDiv);

  const win = window.open('', '_blank');
  win.document.write(buildWorksheetHtml(title, currentExperiment.grade, materials, steps));
  win.document.close();
  win.focus();
  // Give images/fonts time to load
  setTimeout(() => win.print(), 400);
}

function extractSections(container) {
  const headings = container.querySelectorAll('h1,h2,h3,h4');
  let materials = [];
  let steps = [];

  for (const h of headings) {
    const text = h.textContent.toLowerCase();
    const isMatl = /material|supplies/.test(text);
    const isStep = /instruction|step|procedure/.test(text);

    if (!isMatl && !isStep) continue;

    let el = h.nextElementSibling;
    while (el) {
      if (['H1', 'H2', 'H3', 'H4'].includes(el.tagName)) break;
      if (['UL', 'OL'].includes(el.tagName)) {
        const items = Array.from(el.querySelectorAll('li')).map(li =>
          li.textContent.replace(/🔄$/, '').trim()
        );
        if (isMatl) materials = items;
        if (isStep) steps = items;
        break;
      }
      el = el.nextElementSibling;
    }
  }

  return { materials, steps };
}

function buildWorksheetHtml(title, grade, materials, steps) {
  const materialRows = materials.length
    ? materials.map(m => `<li>${escapeHtml(m)}</li>`).join('\n')
    : '<li>See experiment instructions</li>';

  const stepRows = steps.length
    ? steps.map(s => `<li>${escapeHtml(s)}<div class="notes-line"></div></li>`).join('\n')
    : '<li>Follow your experiment steps<div class="notes-line"></div></li>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(title)} — Worksheet</title>
<style>
  body{font-family:Arial,sans-serif;max-width:750px;margin:30px auto;padding:24px;color:#333;}
  h1{font-size:1.4rem;border-bottom:3px solid #4a7a4a;padding-bottom:8px;color:#2d4a2d;margin-bottom:6px;}
  h2{font-size:1rem;color:#4a7a4a;margin-top:22px;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;}
  .meta{font-size:0.85rem;color:#6b9b6b;margin-bottom:16px;}
  .name-date{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:18px;}
  .field{margin-bottom:4px;font-size:0.75rem;color:#6b9b6b;text-transform:uppercase;letter-spacing:1px;}
  .field-line{border:none;border-bottom:2px solid #4a7a4a;width:100%;display:block;height:26px;margin-bottom:14px;}
  .checklist{list-style:none;padding:0;}
  .checklist li{padding:5px 0;display:flex;align-items:flex-start;gap:10px;border-bottom:1px solid #eee;}
  .checklist li::before{content:"☐";font-size:1.1rem;flex-shrink:0;margin-top:1px;}
  .steps-list{padding:0;list-style:none;counter-reset:steps;}
  .steps-list li{counter-increment:steps;margin-bottom:14px;padding-left:32px;position:relative;}
  .steps-list li::before{content:counter(steps);position:absolute;left:0;top:2px;background:#4a7a4a;color:#fff;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;text-align:center;line-height:22px;}
  .notes-line{border:none;border-bottom:1px dashed #ccc;display:block;margin-top:5px;height:22px;}
  table{width:100%;border-collapse:collapse;margin-top:10px;}
  th,td{border:1px solid #ccc;padding:10px;text-align:left;}
  th{background:#eef5e8;font-size:0.85rem;color:#2d4a2d;}
  td{height:38px;}
  .print-btn{margin:16px 0;padding:9px 22px;background:#4a7a4a;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:0.95rem;font-weight:700;}
  @media print{.print-btn{display:none;} body{margin:10px;}}
</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">🖨️ Print Worksheet</button>
<h1>🔬 ${escapeHtml(title)}</h1>
<p class="meta">Science Experiment Worksheet · Grade: ${escapeHtml(grade)}</p>

<div class="name-date">
  <div>
    <div class="field">Student Name</div>
    <span class="field-line"></span>
  </div>
  <div>
    <div class="field">Date</div>
    <span class="field-line"></span>
  </div>
</div>

<h2>📋 Materials Checklist</h2>
<ul class="checklist">${materialRows}</ul>

<h2>📝 Step-by-Step Instructions</h2>
<ol class="steps-list">${stepRows}</ol>

<h2>📊 Observations &amp; Results</h2>
<table>
  <tr><th>Observation #</th><th>What I Noticed</th></tr>
  <tr><td>1</td><td></td></tr>
  <tr><td>2</td><td></td></tr>
  <tr><td>3</td><td></td></tr>
  <tr><td>4</td><td></td></tr>
  <tr><td>Conclusion</td><td></td></tr>
</table>

<button class="print-btn" onclick="window.print()">🖨️ Print Worksheet</button>
</body>
</html>`;
}

// ─── UTILS ───────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── BOOT ────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', init);
