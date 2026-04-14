require('dotenv').config();
const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Available models per provider ───────────────────────────────────────────
const MODELS = {
  openai:    ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'],
  google:    ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
};

// ─── GET /api/providers ───────────────────────────────────────────────────────
// Returns only the providers that have an API key configured in .env
app.get('/api/providers', (req, res) => {
  const available = {};
  if (process.env.OPENAI_API_KEY)    available.openai    = MODELS.openai;
  if (process.env.ANTHROPIC_API_KEY) available.anthropic = MODELS.anthropic;
  if (process.env.GOOGLE_API_KEY)    available.google    = MODELS.google;

  if (Object.keys(available).length === 0) {
    return res.status(503).json({
      error: 'No API keys are configured. Add them to your .env file.',
    });
  }
  res.json(available);
});

// ─── POST /api/generate ───────────────────────────────────────────────────────
app.post('/api/generate', async (req, res) => {
  const { grade, supplies, provider, model } = req.body;

  if (!grade || !supplies || !provider || !model) {
    return res.status(400).json({
      error: 'Missing fields. Please provide grade, supplies, provider, and model.',
    });
  }

  const systemPrompt =
    'You are a K-12 science education assistant. Generate engaging, safe, ' +
    'hands-on science experiments appropriate for the specified grade level ' +
    'using only the listed supplies. Format your response in clear markdown ' +
    'with sections for: title (as H1), learning objectives (as H2), ' +
    'materials needed (as H2 with a bulleted list), step-by-step instructions ' +
    '(as H2 with a numbered list), expected results (as H2), and scientific ' +
    'explanation (as H2).';

  const userPrompt =
    `Grade Level: ${grade}\nAvailable Supplies: ${supplies}\nGenerate a science experiment.`;

  try {
    let text;
    if (provider === 'openai')    text = await callOpenAI(model, systemPrompt, userPrompt);
    else if (provider === 'anthropic') text = await callAnthropic(model, systemPrompt, userPrompt);
    else if (provider === 'google')    text = await callGoogle(model, systemPrompt, userPrompt);
    else return res.status(400).json({ error: `Unknown provider: ${provider}` });

    res.json({ result: text });
  } catch (err) {
    console.error(`[${provider}] Error:`, err.message || err);
    res.status(err.status || 500).json({
      error: err.userMessage || 'The LLM request failed. Check the server logs for details.',
    });
  }
});

// ─── OpenAI ──────────────────────────────────────────────────────────────────
async function callOpenAI(model, system, user) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw userError(401, 'OpenAI API key is not configured on the server.');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: user   },
      ],
      max_tokens: 1500,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw userError(res.status, friendlyLLMError('OpenAI', res.status, body.error?.message));
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

// ─── Anthropic ───────────────────────────────────────────────────────────────
async function callAnthropic(model, system, user) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw userError(401, 'Anthropic API key is not configured on the server.');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method:  'POST',
    headers: {
      'Content-Type':    'application/json',
      'x-api-key':       key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1500,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw userError(res.status, friendlyLLMError('Anthropic', res.status, body.error?.message));
  }
  const data = await res.json();
  return data.content[0].text;
}

// ─── Google Gemini ───────────────────────────────────────────────────────────
async function callGoogle(model, system, user) {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw userError(401, 'Google API key is not configured on the server.');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${system}\n\n${user}` }] }],
      generationConfig: { maxOutputTokens: 1500 },
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw userError(res.status, friendlyLLMError('Google', res.status, body.error?.message));
  }
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

// ─── Error helpers ───────────────────────────────────────────────────────────
function userError(status, message) {
  return { status, userMessage: message, message };
}

function friendlyLLMError(provider, status, detail) {
  if (status === 401) return `Invalid ${provider} API key. Check your .env file.`;
  if (status === 429) return `${provider} rate limit reached. Wait a moment and try again.`;
  if (status >= 500)  return `${provider} server error. Try again in a moment.`;
  return `${provider} request failed (${status})${detail ? ': ' + detail : ''}.`;
}

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🔬 Science Experiment Generator`);
  console.log(`   Running at: http://localhost:${PORT}`);
  console.log(`   Providers configured: ${configuredProviders().join(', ') || 'none — add keys to .env'}\n`);
});

function configuredProviders() {
  return [
    process.env.OPENAI_API_KEY    && 'OpenAI',
    process.env.ANTHROPIC_API_KEY && 'Anthropic',
    process.env.GOOGLE_API_KEY    && 'Google',
  ].filter(Boolean);
}
