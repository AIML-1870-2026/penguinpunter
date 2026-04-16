const LLM = (() => {
  const MODELS = {
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    anthropic: ['claude-sonnet-4-6', 'claude-haiku-4-5-20251001', 'claude-opus-4-7']
  };

  async function callLLM(prompt, { model, apiKey, provider, systemPrompt = '' }) {
    console.log('[LLM REQUEST]', { provider, model, systemPrompt, prompt });
    let text;
    if (provider === 'openai') {
      text = await callOpenAI(model, apiKey, prompt, systemPrompt);
    } else {
      text = await callAnthropic(model, apiKey, prompt, systemPrompt);
    }
    console.log('[LLM RESPONSE]', text);
    return text;
  }

  async function callOpenAI(model, key, prompt, systemPrompt) {
    const body = {
      model,
      messages: [
        { role: 'system', content: systemPrompt || 'You are a blackjack strategy expert.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 512
    };
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const e = new Error(err.error?.message || `HTTP ${res.status}`);
      e.status = res.status;
      throw e;
    }
    const data = await res.json();
    return data.choices[0].message.content;
  }

  async function callAnthropic(model, key, prompt, systemPrompt) {
    const body = {
      model,
      max_tokens: 512,
      system: systemPrompt || 'You are a blackjack strategy expert.',
      messages: [{ role: 'user', content: prompt }]
    };
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const e = new Error(err.error?.message || `HTTP ${res.status}`);
      e.status = res.status;
      throw e;
    }
    const data = await res.json();
    return data.content[0].text;
  }

  return { callLLM, MODELS };
})();
