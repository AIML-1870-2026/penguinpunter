const EnvParser = (() => {
  let apiKeys = { openai: '', anthropic: '' };

  function parseEnvFile(text) {
    const oai = text.match(/OPENAI_API_KEY\s*[=,]\s*["']?([^\s"',\n]+)["']?/i);
    const ant = text.match(/ANTHROPIC_API_KEY\s*[=,]\s*["']?([^\s"',\n]+)["']?/i);
    if (oai) apiKeys.openai = oai[1];
    if (ant) apiKeys.anthropic = ant[1];
    return { hasOpenAI: !!oai, hasAnthropic: !!ant };
  }

  function getKey(provider) { return apiKeys[provider] || ''; }
  function hasKey(provider) { return !!apiKeys[provider]; }
  function hasAnyKey() { return !!(apiKeys.openai || apiKeys.anthropic); }
  function clearKeys() { apiKeys = { openai: '', anthropic: '' }; }

  return { parseEnvFile, getKey, hasKey, hasAnyKey, clearKeys };
})();
