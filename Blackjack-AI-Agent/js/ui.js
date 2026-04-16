const UI = (() => {
  let currentProvider = 'openai';
  let currentModel = 'gpt-4o';
  let riskLevel = 'balanced';
  let explainLevel = 'basic';
  let pendingRecommendation = null;
  let currentChart = 'hard';
  let lastStrategyAction = null;

  function init() {
    setupEnvUpload();
    setupKeyInputs();
    setupProviderPills();
    setupModelSelect();
    setupRiskPills();
    setupExplainPills();
    setupGameButtons();
    setupStrategyTabs();
    renderStrategyChart(null);
    updateBalanceDisplay();
  }

  // ── KEY INPUTS ──────────────────────────────────────────────────────────────
  function setupKeyInputs() {
    const map = { openaiKeyInput: 'openai', anthropicKeyInput: 'anthropic' };
    Object.entries(map).forEach(([id, provider]) => {
      const input = document.getElementById(id);
      input.addEventListener('input', () => {
        EnvParser.setKey(provider, input.value);
        input.classList.toggle('has-value', !!input.value.trim());
        updateKeyStatus();
      });
    });
  }

  function updateKeyStatus() {
    const status = document.getElementById('keyStatus');
    const hasOAI = EnvParser.hasKey('openai');
    const hasAnt = EnvParser.hasKey('anthropic');
    if (hasOAI || hasAnt) {
      const names = [hasOAI ? 'OpenAI' : null, hasAnt ? 'Anthropic' : null].filter(Boolean);
      status.textContent = '✓ ' + names.join(' & ') + ' loaded';
      status.className = 'key-status loaded';
    } else {
      status.textContent = 'No key loaded';
      status.className = 'key-status';
    }
  }

  function toggleKeyVisibility(btn) {
    const input = document.getElementById(btn.dataset.target);
    input.type = input.type === 'password' ? 'text' : 'password';
  }

  // ── ENV UPLOAD ──────────────────────────────────────────────────────────────
  function setupEnvUpload() {
    document.getElementById('envUpload').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const result = EnvParser.parseEnvFile(ev.target.result);
        // Sync text inputs with parsed keys
        if (result.hasOpenAI) {
          const inp = document.getElementById('openaiKeyInput');
          inp.value = EnvParser.getKey('openai');
          inp.classList.add('has-value');
        }
        if (result.hasAnthropic) {
          const inp = document.getElementById('anthropicKeyInput');
          inp.value = EnvParser.getKey('anthropic');
          inp.classList.add('has-value');
        }
        if (result.hasOpenAI || result.hasAnthropic) {
          if (!EnvParser.hasKey(currentProvider)) {
            setProvider(result.hasOpenAI ? 'openai' : 'anthropic');
          }
        } else {
          document.getElementById('keyStatus').textContent = '✗ No key found in file';
          document.getElementById('keyStatus').className = 'key-status error';
        }
        updateKeyStatus();
      };
      reader.readAsText(file);
    });
  }

  // ── PROVIDER / MODEL ────────────────────────────────────────────────────────
  function setupProviderPills() {
    document.querySelectorAll('#providerPills .pill').forEach(btn => {
      btn.addEventListener('click', () => setProvider(btn.dataset.provider));
    });
  }

  function setProvider(provider) {
    currentProvider = provider;
    document.querySelectorAll('#providerPills .pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.provider === provider);
    });
    populateModelSelect();
  }

  function setupModelSelect() {
    document.getElementById('modelSelect').addEventListener('change', e => {
      currentModel = e.target.value;
    });
  }

  function populateModelSelect() {
    const sel = document.getElementById('modelSelect');
    sel.innerHTML = '';
    (LLM.MODELS[currentProvider] || []).forEach(m => {
      const opt = document.createElement('option');
      opt.value = m; opt.textContent = m;
      sel.appendChild(opt);
    });
    currentModel = sel.value;
  }

  // ── RISK / EXPLAIN PILLS ─────────────────────────────────────────────────────
  function setupRiskPills() {
    document.querySelectorAll('#riskPills .pill').forEach(btn => {
      btn.addEventListener('click', () => {
        riskLevel = btn.dataset.risk;
        document.querySelectorAll('#riskPills .pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  function setupExplainPills() {
    document.querySelectorAll('#explanationPills .pill').forEach(btn => {
      btn.addEventListener('click', () => {
        explainLevel = btn.dataset.level;
        document.querySelectorAll('#explanationPills .pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  // ── GAME BUTTONS ─────────────────────────────────────────────────────────────
  function setupGameButtons() {
    document.getElementById('dealBtn').addEventListener('click', deal);
    document.getElementById('hitBtn').addEventListener('click', () => performAction('hit'));
    document.getElementById('standBtn').addEventListener('click', () => performAction('stand'));
    document.getElementById('doubleBtn').addEventListener('click', () => performAction('double'));
    document.getElementById('splitBtn').addEventListener('click', () => performAction('split'));
    document.getElementById('insuranceBtn').addEventListener('click', () => performAction('insurance'));
    document.getElementById('noInsuranceBtn').addEventListener('click', () => performAction('noinsurance'));
    document.getElementById('executeBtn').addEventListener('click', executeRecommendation);
  }

  function setupStrategyTabs() {
    document.querySelectorAll('.strat-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        currentChart = tab.dataset.chart;
        document.querySelectorAll('.strat-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderStrategyChart(Blackjack.getState());
      });
    });
  }

  // ── DEAL ──────────────────────────────────────────────────────────────────────
  function deal() {
    const bet = parseInt(document.getElementById('betInput').value) || 0;
    if (bet <= 0) { setStatus('Enter a valid bet amount.'); return; }
    if (bet > Blackjack.getBalance()) { setStatus('Bet exceeds balance.'); return; }

    pendingRecommendation = null;
    document.getElementById('executeBtn').disabled = true;
    setRecAction('—');
    setRecText('Consulting AI...');

    const ok = Blackjack.newHand(bet);
    if (!ok) { setStatus('Could not start hand. Check bet.'); return; }

    Analytics.recordBet(bet);
    renderGameState();

    const state = Blackjack.getState();

    if (state.phase === 'round_complete') {
      handleRoundComplete(state);
      return;
    }

    if (state.phase === 'insurance_offered') {
      showInsuranceOptions(true);
      setStatus('Dealer shows Ace. Take insurance? (pays 2:1 if dealer has Blackjack)');
      fetchRecommendation();
      return;
    }

    fetchRecommendation();
  }

  // ── ACTIONS ───────────────────────────────────────────────────────────────────
  function performAction(action) {
    pendingRecommendation = null;
    document.getElementById('executeBtn').disabled = true;

    let ok = false;
    if (action === 'hit') ok = Blackjack.hit();
    else if (action === 'stand') ok = Blackjack.stand();
    else if (action === 'double') ok = Blackjack.double();
    else if (action === 'split') ok = Blackjack.split();
    else if (action === 'insurance') ok = Blackjack.takeInsurance(true);
    else if (action === 'noinsurance') ok = Blackjack.takeInsurance(false);

    if (!ok) return;

    showInsuranceOptions(false);
    renderGameState();

    const state = Blackjack.getState();

    if (state.phase === 'round_complete') {
      handleRoundComplete(state);
    } else if (state.phase === 'player_turn') {
      setRecAction('—');
      setRecText('');
      fetchRecommendation();
    } else if (state.phase === 'dealer_turn') {
      setStatus('Dealer is playing...');
    }
  }

  function executeRecommendation() {
    if (!pendingRecommendation) return;
    const action = pendingRecommendation;
    performAction(action);
  }

  // ── LLM RECOMMENDATION ────────────────────────────────────────────────────────
  async function fetchRecommendation() {
    const state = Blackjack.getState();
    if (!['player_turn', 'insurance_offered'].includes(state.phase)) return;

    if (!EnvParser.hasAnyKey()) {
      setRecText('Upload a .env file with an API key to get AI recommendations.\n\nYou can still play manually using the action buttons.');
      return;
    }

    const key = EnvParser.getKey(currentProvider);
    if (!key) {
      setRecText(`No ${currentProvider} key loaded. Switch provider or upload a .env with that key.`);
      return;
    }

    showRecLoading(true);
    setRecAction('—');
    setRecText('');
    document.getElementById('executeBtn').disabled = true;

    const { prompt, systemPrompt } = Agent.buildPrompt(state, riskLevel, explainLevel);

    try {
      const response = await LLM.callLLM(prompt, {
        model: currentModel,
        apiKey: key,
        provider: currentProvider,
        systemPrompt,
      });

      const action = Agent.parseRecommendation(response, state);
      pendingRecommendation = action;

      setRecAction(action.toUpperCase());
      setRecText(response);
      document.getElementById('executeBtn').disabled = false;

      // Track LLM vs basic strategy accuracy
      const stratAction = Strategy.getAction(state);
      lastStrategyAction = stratAction;
      Analytics.recordRecommendation(action, stratAction);
      renderStrategyChart(state);

    } catch (err) {
      let msg = err.message || 'Unknown error';
      if (err instanceof TypeError && msg.includes('fetch')) {
        msg = currentProvider === 'anthropic'
          ? 'Anthropic API blocked CORS (browser restriction). Try OpenAI instead.'
          : 'Network error. Check your connection.';
      } else if (err.status === 401 || err.status === 403) {
        msg = 'Invalid API key. Check your .env file.';
      } else if (err.status === 429) {
        msg = 'Rate limit hit. Wait a moment and try again.';
      }
      setRecText('Error: ' + msg);
      document.getElementById('executeBtn').disabled = true;
    } finally {
      showRecLoading(false);
    }
  }

  // ── ROUND COMPLETE ────────────────────────────────────────────────────────────
  function handleRoundComplete(state) {
    state.handResults.forEach((result, i) => {
      Analytics.recordResult(result, state.handBets[i] || state.currentBet);
    });
    Analytics.recordBalance(Blackjack.getBalance());
    updateBalanceDisplay();
    renderAnalytics();
    renderGameState();

    const msgs = {
      win: '🎉 You win!',
      lose: '😔 Dealer wins.',
      push: '🤝 Push — bet returned.',
      blackjack: '🃏 Blackjack! 1.5× payout!',
    };
    const resultMsg = state.handResults.map(r => msgs[r] || r).join('  ');
    setStatus(resultMsg);

    document.getElementById('dealBtn').disabled = false;
    document.getElementById('betInput').disabled = false;
    setActionButtonsEnabled(false);
    showInsuranceOptions(false);
    setRecText('Hand complete. Deal a new hand for the next recommendation.');
    setRecAction('—');
    pendingRecommendation = null;
    document.getElementById('executeBtn').disabled = true;

    if (Blackjack.getBalance() <= 0) {
      setTimeout(() => {
        document.getElementById('gameOverModal').style.display = 'flex';
      }, 800);
    }
  }

  // ── RENDER GAME STATE ─────────────────────────────────────────────────────────
  function renderGameState() {
    const state = Blackjack.getState();

    // Render dealer hand
    const dealerRow = document.getElementById('dealerCards');
    dealerRow.innerHTML = '';
    if (state.dealerHand && state.dealerHand.length > 0) {
      state.dealerHand.forEach(card => dealerRow.appendChild(renderCard(card)));
    }

    const dealerScoreEl = document.getElementById('dealerScore');
    if (state.dealerHand && state.dealerHand.length > 0) {
      dealerScoreEl.textContent = state.dealerHoleVisible
        ? state.dealerTotal
        : (state.dealerHand[0] ? Blackjack.handTotal([state.dealerHand[0]]) + ' + ?' : '--');
    } else {
      dealerScoreEl.textContent = '--';
    }

    // Render player hands
    const handsContainer = document.getElementById('handsContainer');
    handsContainer.innerHTML = '';
    if (state.playerHands && state.playerHands.length > 0) {
      state.playerHands.forEach((hand, i) => {
        const handEl = document.createElement('div');
        handEl.className = 'hand-group' + (i === state.currentHandIdx && state.phase === 'player_turn' ? ' active-hand' : '');
        if (state.playerHands.length > 1) {
          const lbl = document.createElement('div');
          lbl.className = 'hand-label';
          lbl.textContent = 'Hand ' + (i + 1) + (i === state.currentHandIdx ? ' ◀' : '');
          handEl.appendChild(lbl);
        }
        const cardsRow = document.createElement('div');
        cardsRow.className = 'cards-row';
        hand.forEach(card => cardsRow.appendChild(renderCard(card)));
        handEl.appendChild(cardsRow);
        handsContainer.appendChild(handEl);
      });
    }

    const playerScoreEl = document.getElementById('playerScore');
    if (state.playerHands && state.playerHands.length > 0) {
      const scores = state.playerHands.map(h => {
        const t = Blackjack.handTotal(h);
        return t > 21 ? t + ' BUST' : (Blackjack.isSoft(h) ? 'Soft ' + t : String(t));
      });
      playerScoreEl.textContent = scores.join(' / ');
    } else {
      playerScoreEl.textContent = '--';
    }

    updateBalanceDisplay();

    // Update button states
    if (state.phase === 'player_turn') {
      document.getElementById('dealBtn').disabled = true;
      document.getElementById('betInput').disabled = true;
      document.getElementById('hitBtn').disabled = !state.canHit;
      document.getElementById('standBtn').disabled = !state.canStand;
      document.getElementById('doubleBtn').disabled = !state.canDouble;
      document.getElementById('splitBtn').disabled = !state.canSplit;
    } else if (state.phase === 'idle' || state.phase === 'round_complete') {
      document.getElementById('dealBtn').disabled = false;
      document.getElementById('betInput').disabled = false;
      setActionButtonsEnabled(false);
    }

    // Add result overlays
    if (state.phase === 'round_complete' && state.handResults.length > 0) {
      const handEls = handsContainer.querySelectorAll('.hand-group');
      state.handResults.forEach((result, i) => {
        const el = handEls[i] || handsContainer;
        el.classList.remove('result-win', 'result-lose', 'result-push', 'result-blackjack');
        el.classList.add('result-' + result);
      });
      if (handEls.length === 0 && state.handResults[0]) {
        handsContainer.classList.remove('result-win', 'result-lose', 'result-push', 'result-blackjack');
        handsContainer.classList.add('result-' + state.handResults[0]);
      }
    }
  }

  function renderCard(card) {
    const el = document.createElement('div');
    el.className = 'playing-card';
    if (card.faceDown) {
      el.classList.add('face-down');
      el.innerHTML = '<div class="card-back-inner"></div>';
      return el;
    }
    const isRed = ['♥', '♦'].includes(card.suit);
    el.classList.add(isRed ? 'red' : 'black');
    el.innerHTML = `
      <div class="card-corner top-left"><span class="card-rank">${card.rank}</span><span class="card-suit-sm">${card.suit}</span></div>
      <div class="card-center-suit">${card.suit}</div>
      <div class="card-corner bottom-right"><span class="card-rank">${card.rank}</span><span class="card-suit-sm">${card.suit}</span></div>
    `;
    return el;
  }

  // ── HELPERS ───────────────────────────────────────────────────────────────────
  function setActionButtonsEnabled(enabled) {
    ['hitBtn', 'standBtn', 'doubleBtn', 'splitBtn'].forEach(id => {
      document.getElementById(id).disabled = !enabled;
    });
  }

  function showInsuranceOptions(show) {
    document.getElementById('insuranceBtn').style.display = show ? '' : 'none';
    document.getElementById('noInsuranceBtn').style.display = show ? '' : 'none';
    document.getElementById('hitBtn').style.display = show ? 'none' : '';
    document.getElementById('standBtn').style.display = show ? 'none' : '';
    document.getElementById('doubleBtn').style.display = show ? 'none' : '';
    document.getElementById('splitBtn').style.display = show ? 'none' : '';
  }

  function setStatus(msg) {
    document.getElementById('statusMessage').textContent = msg;
  }

  function setRecAction(action) {
    document.getElementById('recAction').textContent = action;
  }

  function setRecText(text) {
    document.getElementById('recText').textContent = text;
  }

  function showRecLoading(on) {
    document.getElementById('recLoading').style.display = on ? 'flex' : 'none';
    document.getElementById('recText').style.display = on ? 'none' : '';
  }

  function updateBalanceDisplay() {
    document.getElementById('balanceDisplay').textContent = Blackjack.getBalance().toLocaleString();
    const betInput = document.getElementById('betInput');
    betInput.max = Blackjack.getBalance();
  }

  // ── STRATEGY CHART ────────────────────────────────────────────────────────────
  function renderStrategyChart(state) {
    const container = document.getElementById('strategyChart');
    container.innerHTML = '';
    container.appendChild(Strategy.renderChart(currentChart, state));
  }

  // ── ANALYTICS ─────────────────────────────────────────────────────────────────
  function renderAnalytics() {
    const stats = Analytics.getStats();
    document.getElementById('statWins').textContent = stats.wins;
    document.getElementById('statLosses').textContent = stats.losses;
    document.getElementById('statPushes').textContent = stats.pushes;
    document.getElementById('statWinRate').textContent = stats.winRate;
    document.getElementById('statLLMAccuracy').textContent = stats.llmAccuracy;
    document.getElementById('statBigWin').textContent = stats.biggestWin;
    Analytics.renderBankrollChart(document.getElementById('bankrollChart'));
  }

  // ── RESET ──────────────────────────────────────────────────────────────────────
  function resetGame() {
    Blackjack.resetBalance();
    Analytics.reset();
    pendingRecommendation = null;
    document.getElementById('gameOverModal').style.display = 'none';
    document.getElementById('dealerCards').innerHTML = '';
    document.getElementById('handsContainer').innerHTML = '';
    document.getElementById('dealerScore').textContent = '--';
    document.getElementById('playerScore').textContent = '--';
    setStatus('Place your bet and click Deal to begin.');
    setRecAction('—');
    setRecText('Waiting for a hand to begin...');
    document.getElementById('executeBtn').disabled = true;
    document.getElementById('dealBtn').disabled = false;
    document.getElementById('betInput').disabled = false;
    setActionButtonsEnabled(false);
    showInsuranceOptions(false);
    updateBalanceDisplay();
    renderAnalytics();
    renderStrategyChart(null);
  }

  return { init, resetGame, toggleKeyVisibility };
})();

window.addEventListener('DOMContentLoaded', UI.init);
