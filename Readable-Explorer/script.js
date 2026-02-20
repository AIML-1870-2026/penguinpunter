/* ============================================================
   READABLE EXPLORER — script.js
   ============================================================ */

// ---- STATE ----
const state = {
  bg:        { r: 255, g: 255, b: 255 },
  text:      { r: 20,  g: 20,  b: 20  },
  fontSize:  16,
  vision:    'normal',
  history:   []   // [{bg, text}, ...]  max 5
};

// ---- PRESETS ----
const PRESETS = {
  'high-contrast': { bg: [255,255,255], text: [0,0,0] },
  'low-contrast':  { bg: [170,170,170], text: [136,136,136] },
  'dark-mode':     { bg: [26,26,46],    text: [255,255,255] },
  'ocean':         { bg: [224,247,250], text: [13,79,108] },
  'problematic':   { bg: [0,170,0],     text: [204,0,0] },
  'sunset':        { bg: [255,203,164], text: [59,31,14] }
};

// ---- DOM REFS ----
const $ = id => document.getElementById(id);

const bgSliders  = { r: $('bg-r'),   g: $('bg-g'),   b: $('bg-b')   };
const bgNums     = { r: $('bg-r-num'), g: $('bg-g-num'), b: $('bg-b-num') };
const textSliders= { r: $('text-r'), g: $('text-g'), b: $('text-b') };
const textNums   = { r: $('text-r-num'), g: $('text-g-num'), b: $('text-b-num') };

const fontSlider = $('font-size');
const fontLabel  = $('font-size-label');
const displayCard= $('display-card');
const displayText= $('display-text');
const bgSwatch   = $('bg-swatch');
const textSwatch = $('text-swatch');
const bgHex      = $('bg-hex');
const textHex    = $('text-hex');
const lumBgEl    = $('lum-bg');
const lumTextEl  = $('lum-text');
const contrastEl = $('contrast-ratio');
const gaugeFill  = $('gauge-bar-fill');
const historyRow = $('history-row');
const visionNote = $('vision-note');
const toastEl    = $('toast');

// ---- WCAG CALCULATION ----
function linearize(c) {
  const n = c / 255;
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

function luminance({ r, g, b }) {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrastRatio(l1, l2) {
  const lighter = Math.max(l1, l2);
  const darker  = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ---- COLOR HELPERS ----
function toHex({ r, g, b }) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function isLarge(fontSize) {
  // WCAG: large text = 18px+ (regular weight)
  return fontSize >= 18;
}

// ---- UPDATE UI ----
function update() {
  const { bg, text, fontSize, vision } = state;

  // Display card colors
  displayCard.style.backgroundColor = `rgb(${bg.r},${bg.g},${bg.b})`;
  displayText.style.color           = `rgb(${text.r},${text.g},${text.b})`;
  displayText.style.fontSize        = `${fontSize}px`;

  // Vision filter on display card
  const filterMap = {
    normal:       'none',
    protanopia:   'url(#filter-protanopia)',
    deuteranopia: 'url(#filter-deuteranopia)',
    tritanopia:   'url(#filter-tritanopia)',
    monochromacy: 'url(#filter-monochromacy)'
  };
  displayCard.style.filter = filterMap[vision] || 'none';

  // Swatches + hex labels
  bgSwatch.style.background   = `rgb(${bg.r},${bg.g},${bg.b})`;
  textSwatch.style.background = `rgb(${text.r},${text.g},${text.b})`;
  bgHex.textContent   = toHex(bg);
  textHex.textContent = toHex(text);

  // Font size label
  fontLabel.textContent = `${fontSize}px`;

  // Luminance
  const lumBg   = luminance(bg);
  const lumText = luminance(text);
  const ratio   = contrastRatio(lumBg, lumText);

  // Flash animation
  flashValue(lumBgEl,   lumBg.toFixed(3));
  flashValue(lumTextEl, lumText.toFixed(3));

  // Contrast ratio
  contrastEl.textContent = `${ratio.toFixed(2)}:1`;

  // Gauge (max meaningful is 21:1)
  const pct = Math.min((ratio / 21) * 100, 100);
  gaugeFill.style.width = `${pct}%`;

  // WCAG badges
  const large = isLarge(fontSize);
  const aaThresh   = large ? 3.0 : 4.5;
  const aaaThresh  = large ? 4.5 : 7.0;
  const aaLarge    = 3.0;
  const aaaLarge   = 4.5;

  setBadge('badge-aa-normal',  ratio >= 4.5);
  setBadge('badge-aaa-normal', ratio >= 7.0);
  setBadge('badge-aa-large',   ratio >= 3.0);
  setBadge('badge-aaa-large',  ratio >= 4.5);

  // Display card border
  const passAA = ratio >= aaThresh;
  displayCard.style.borderColor = passAA ? '#22c55e' : '#ef4444';

  // Sync sliders + inputs
  syncControls('bg',   bg);
  syncControls('text', text);
  fontSlider.value = fontSize;

  // Vision slider disable
  const simActive = vision !== 'normal';
  setColorControlsDisabled(simActive);
  visionNote.classList.toggle('hidden', !simActive);

  // URL state
  updateURL();
}

function flashValue(el, val) {
  if (el.textContent === val) return;
  el.textContent = val;
  el.classList.remove('flash');
  void el.offsetWidth; // reflow
  el.classList.add('flash');
}

function setBadge(id, passes) {
  const el = $(id);
  el.classList.toggle('pass', passes);
  el.classList.toggle('fail', !passes);
  el.querySelector('.badge-icon').textContent = passes ? '✓' : '✗';
}

function syncControls(which, color) {
  const sliders = which === 'bg' ? bgSliders : textSliders;
  const nums    = which === 'bg' ? bgNums    : textNums;
  for (const ch of ['r','g','b']) {
    if (document.activeElement !== sliders[ch]) sliders[ch].value = color[ch];
    if (document.activeElement !== nums[ch])    nums[ch].value    = color[ch];
  }
}

function setColorControlsDisabled(disabled) {
  for (const ch of ['r','g','b']) {
    bgSliders[ch].disabled  = disabled;
    bgNums[ch].disabled     = disabled;
    textSliders[ch].disabled= disabled;
    textNums[ch].disabled   = disabled;
  }
}

// ---- EVENT LISTENERS ----

// Background sliders
for (const ch of ['r','g','b']) {
  bgSliders[ch].addEventListener('input', () => {
    state.bg[ch] = parseInt(bgSliders[ch].value);
    bgNums[ch].value = state.bg[ch];
    update();
  });
  bgNums[ch].addEventListener('input', () => {
    const v = Math.max(0, Math.min(255, parseInt(bgNums[ch].value) || 0));
    state.bg[ch] = v;
    bgNums[ch].value = v;
    bgSliders[ch].value = v;
    update();
  });
}

// Text sliders
for (const ch of ['r','g','b']) {
  textSliders[ch].addEventListener('input', () => {
    state.text[ch] = parseInt(textSliders[ch].value);
    textNums[ch].value = state.text[ch];
    update();
  });
  textNums[ch].addEventListener('input', () => {
    const v = Math.max(0, Math.min(255, parseInt(textNums[ch].value) || 0));
    state.text[ch] = v;
    textNums[ch].value = v;
    textSliders[ch].value = v;
    update();
  });
}

// Font size
fontSlider.addEventListener('input', () => {
  state.fontSize = parseInt(fontSlider.value);
  update();
});

// Vision type
document.querySelectorAll('input[name="vision"]').forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.checked) {
      state.vision = radio.value;
      update();
    }
  });
});

// Presets
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.preset;
    if (!PRESETS[key]) return;
    pushHistory();
    const [br,bg,bb] = PRESETS[key].bg;
    const [tr,tg,tb] = PRESETS[key].text;
    state.bg   = { r: br, g: bg, b: bb };
    state.text = { r: tr, g: tg, b: tb };
    update();
  });
});

// Copy CSS
$('copy-css-btn').addEventListener('click', () => {
  const { bg, text, fontSize } = state;
  const css = `background-color: rgb(${bg.r}, ${bg.g}, ${bg.b});\ncolor: rgb(${text.r}, ${text.g}, ${text.b});\nfont-size: ${fontSize}px;`;
  navigator.clipboard.writeText(css).then(() => showToast('Copied!'));
});

// Suggest Better Contrast
$('suggest-btn').addEventListener('click', suggestContrast);

// ---- SUGGEST CONTRAST ----
function suggestContrast() {
  const bgLum = luminance(state.bg);
  // Try white first, then black
  const whiteLum = luminance({ r: 255, g: 255, b: 255 });
  const blackLum = luminance({ r: 0,   g: 0,   b: 0   });
  const whiteRatio = contrastRatio(bgLum, whiteLum);
  const blackRatio = contrastRatio(bgLum, blackLum);

  const target = whiteRatio >= blackRatio
    ? { r: 255, g: 255, b: 255 }
    : { r: 0,   g: 0,   b: 0   };

  pushHistory();
  animateColor('text', target);
}

function animateColor(which, target) {
  const start = { ...state[which] };
  const duration = 600;
  const startTime = performance.now();

  function step(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t; // ease in-out quad
    state[which] = {
      r: Math.round(start.r + (target.r - start.r) * ease),
      g: Math.round(start.g + (target.g - start.g) * ease),
      b: Math.round(start.b + (target.b - start.b) * ease)
    };
    update();
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ---- HISTORY ----
function pushHistory() {
  const entry = {
    bg:   { ...state.bg },
    text: { ...state.text }
  };
  // Don't push duplicates
  const last = state.history[state.history.length - 1];
  if (last && JSON.stringify(last) === JSON.stringify(entry)) return;

  state.history.push(entry);
  if (state.history.length > 5) state.history.shift();
  renderHistory();
}

function renderHistory() {
  historyRow.innerHTML = '';
  state.history.slice().reverse().forEach((entry, i) => {
    const swatch = document.createElement('div');
    swatch.className = 'history-swatch';
    swatch.title = `BG: ${toHex(entry.bg)} / Text: ${toHex(entry.text)}`;

    const left = document.createElement('div');
    left.className = 'half';
    left.style.background = `rgb(${entry.bg.r},${entry.bg.g},${entry.bg.b})`;

    const right = document.createElement('div');
    right.className = 'half';
    right.style.background = `rgb(${entry.text.r},${entry.text.g},${entry.text.b})`;

    swatch.appendChild(left);
    swatch.appendChild(right);

    swatch.addEventListener('click', () => {
      pushHistory();
      state.bg   = { ...entry.bg };
      state.text = { ...entry.text };
      update();
    });

    historyRow.appendChild(swatch);
  });
}

// ---- URL STATE ----
function updateURL() {
  const { bg, text, fontSize, vision } = state;
  const hash = `#bg=${bg.r},${bg.g},${bg.b}&txt=${text.r},${text.g},${text.b}&size=${fontSize}&vision=${vision}`;
  history.replaceState(null, '', hash);
}

function loadFromURL() {
  const hash = location.hash.slice(1);
  if (!hash) return;
  const params = Object.fromEntries(hash.split('&').map(p => p.split('=')));
  if (params.bg) {
    const [r,g,b] = params.bg.split(',').map(Number);
    if (!isNaN(r)) state.bg = { r: clamp(r), g: clamp(g), b: clamp(b) };
  }
  if (params.txt) {
    const [r,g,b] = params.txt.split(',').map(Number);
    if (!isNaN(r)) state.text = { r: clamp(r), g: clamp(g), b: clamp(b) };
  }
  if (params.size) {
    const s = parseInt(params.size);
    if (!isNaN(s)) state.fontSize = Math.max(10, Math.min(72, s));
  }
  if (params.vision) {
    const valid = ['normal','protanopia','deuteranopia','tritanopia','monochromacy'];
    if (valid.includes(params.vision)) {
      state.vision = params.vision;
      const radio = document.querySelector(`input[name="vision"][value="${params.vision}"]`);
      if (radio) radio.checked = true;
    }
  }
}

function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }

// ---- TOAST ----
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 1800);
}

// ---- INIT ----
loadFromURL();
update();
