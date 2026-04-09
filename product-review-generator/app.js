// ─── STATE ────────────────────────────────────────────────────────────────────
let apiKey = '';
let cachedModels = null;

// ─── DOM REFS ─────────────────────────────────────────────────────────────────
const envUpload     = document.getElementById('envUpload');
const keyStatus     = document.getElementById('keyStatus');
const modelSelect   = document.getElementById('modelSelect');
const modelStatus   = document.getElementById('modelStatus');
const sentimentSlider = document.getElementById('sentimentSlider');
const sentimentValue  = document.getElementById('sentimentValue');
const generateBtn   = document.getElementById('generateBtn');
const outputPanel   = document.getElementById('outputPanel');
const aboutBtn      = document.getElementById('aboutBtn');
const aboutModal    = document.getElementById('aboutModal');
const modalClose    = document.getElementById('modalClose');

// ─── INIT ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  fetchModels();
});

// ─── ENV FILE LOADING ─────────────────────────────────────────────────────────
// Pattern mirrors the Switchboard reference (temp/switchboard.html → handleFileUpload)
envUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const text = ev.target.result;
    const match = text.match(/OPENAI_API_KEY\s*[=,]\s*["']?([^\s"',\n]+)["']?/i);
    if (match) {
      apiKey = match[1].trim();
      setKeyStatus('loaded', '✅ OpenAI key loaded successfully');
      updateGenerateBtn();
    } else {
      apiKey = '';
      setKeyStatus('error', '❌ Could not find OPENAI_API_KEY in the file');
      updateGenerateBtn();
    }
  };
  reader.readAsText(file);
});

function setKeyStatus(state, message) {
  keyStatus.textContent = message;
  keyStatus.className = 'key-status ' + state;
}

// ─── MODEL FETCHING ───────────────────────────────────────────────────────────
async function fetchModels() {
  if (cachedModels) {
    populateModelSelect(cachedModels);
    setModelStatus('cached', '✅ Models discovered successfully (cached)');
    return;
  }

  setModelStatus('', 'Fetching available models…');

  try {
    // Fetch without auth — OpenAI returns a public model list
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Filter to GPT chat models, sort newest first
    const gptModels = data.data
      .map(m => m.id)
      .filter(id => /^gpt/i.test(id))
      .sort((a, b) => b.localeCompare(a));

    if (gptModels.length === 0) throw new Error('No GPT models found');

    cachedModels = gptModels;
    populateModelSelect(gptModels);
    setModelStatus('ok', '✅ Models discovered successfully');
  } catch (err) {
    // Fallback to a sensible static list if fetch fails
    const fallback = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'];
    populateModelSelect(fallback);
    setModelStatus('error', `⚠️ Could not fetch live models — using defaults (${err.message})`);
  }
}

function populateModelSelect(models) {
  modelSelect.innerHTML = '';
  const preferred = ['gpt-4o', 'gpt-5', 'gpt-4o-mini'];
  let defaultModel = models[0];
  for (const p of preferred) {
    if (models.includes(p)) { defaultModel = p; break; }
  }
  models.forEach(id => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = id;
    if (id === defaultModel) opt.selected = true;
    modelSelect.appendChild(opt);
  });
}

function setModelStatus(state, message) {
  modelStatus.textContent = message;
  modelStatus.className = 'model-status ' + state;
}

// Re-fetch with key once loaded (so full model list is available)
document.getElementById('envUpload').addEventListener('change', () => {
  setTimeout(() => {
    if (apiKey && !cachedModels) {
      cachedModels = null; // force re-fetch with auth
      fetchModels();
    }
  }, 200);
});

// ─── SENTIMENT SLIDER ─────────────────────────────────────────────────────────
sentimentSlider.addEventListener('input', () => {
  sentimentValue.textContent = sentimentSlider.value;
});

// ─── GENERATE BUTTON STATE ───────────────────────────────────────────────────
function updateGenerateBtn() {
  generateBtn.disabled = !apiKey;
}

// ─── ABOUT MODAL ──────────────────────────────────────────────────────────────
aboutBtn.addEventListener('click', () => aboutModal.classList.add('open'));
modalClose.addEventListener('click', () => aboutModal.classList.remove('open'));
aboutModal.addEventListener('click', (e) => {
  if (e.target === aboutModal) aboutModal.classList.remove('open');
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') aboutModal.classList.remove('open');
});

// ─── GENERATE REVIEW ─────────────────────────────────────────────────────────
generateBtn.addEventListener('click', generateReview);

async function generateReview() {
  const productName = document.getElementById('productName').value.trim();
  const category    = document.getElementById('category').value;
  const length      = document.getElementById('reviewLength').value;
  const style       = document.getElementById('reviewStyle').value;
  const comments    = document.getElementById('comments').value.trim();
  const model       = modelSelect.value;
  const sentiment   = parseInt(sentimentSlider.value, 10);

  if (!productName) {
    showOutput('<em>Please enter a product name before generating.</em>', false);
    return;
  }

  if (!apiKey) {
    showOutput('<em>Please upload your .env file with OPENAI_API_KEY first.</em>', false);
    return;
  }

  const sentimentLabel = sentiment < 35 ? 'negative' : sentiment > 65 ? 'positive' : 'mixed/neutral';
  const sentimentDetail = sentiment < 35
    ? 'The reviewer is dissatisfied and critical.'
    : sentiment > 65
    ? 'The reviewer is satisfied and enthusiastic.'
    : 'The reviewer has a balanced, mixed view.';

  const systemPrompt = `You are a consumer who has used a product and is writing an online review.
Write in a ${style.toLowerCase()} tone. The review should be ${length.toLowerCase()} in length.
The overall sentiment should be ${sentimentLabel} (score: ${sentiment}/100). ${sentimentDetail}
Format your response using markdown — use bold for key points, and bullet lists where appropriate.
Do not mention that you are an AI or that this is a generated review.`;

  const userPrompt = `Write a product review for: ${productName} (Category: ${category}).${comments ? `\n\nAdditional context and instructions:\n${comments}` : ''}`;

  setLoading(true);

  try {
    // API call mirrors callOpenAI() in temp/switchboard.html
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt }
        ],
        max_tokens: length === 'Short' ? 300 : length === 'Medium' ? 600 : 1000
      }),
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const text = data.choices[0].message.content;
    const html = marked.parse(text);
    showOutput(html, false);

  } catch (err) {
    if (err.name === 'AbortError') {
      showOutput('<em>Request timed out. Please try again.</em>', false);
    } else {
      showOutput(`<em>Error: ${friendlyError(err)}</em>`, false);
    }
  } finally {
    setLoading(false);
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function setLoading(loading) {
  generateBtn.disabled = loading;
  if (loading) {
    outputPanel.className = 'output-panel loading';
    outputPanel.innerHTML = '<div class="spinner"></div> Generating review…';
  }
}

function showOutput(html, empty) {
  outputPanel.className = 'output-panel' + (empty ? ' empty' : '');
  outputPanel.innerHTML = html;
}

function friendlyError(err) {
  const msg = err.message || '';
  if (msg.includes('401') || msg.includes('Incorrect API key') || msg.includes('invalid_api_key'))
    return 'Invalid API key. Please check your .env file and try again.';
  if (msg.includes('429') || msg.includes('Rate limit'))
    return 'Rate limit reached. Please wait a moment and try again.';
  if (msg.includes('insufficient_quota') || msg.includes('exceeded your current quota'))
    return 'OpenAI quota exceeded. Please check your billing at platform.openai.com.';
  if (msg.includes('model_not_found'))
    return 'Selected model not available on your account. Try a different model.';
  return msg || 'An unexpected error occurred.';
}
