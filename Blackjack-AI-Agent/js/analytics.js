const Analytics = (() => {
  let wins = 0, losses = 0, pushes = 0;
  let totalBet = 0, biggestWin = 0, biggestLoss = 0;
  let llmCorrect = 0, llmTotal = 0;
  let balanceHistory = [1000];
  let currentBet = 0;

  function recordBet(bet) { currentBet = bet; }

  function recordResult(result, bet) {
    if (result === 'win' || result === 'blackjack') {
      wins++;
      const gain = result === 'blackjack' ? Math.floor(bet * 1.5) : bet;
      if (gain > biggestWin) biggestWin = gain;
    } else if (result === 'lose') {
      losses++;
      if (bet > biggestLoss) biggestLoss = bet;
    } else if (result === 'push') {
      pushes++;
    }
    totalBet += bet;
  }

  function recordBalance(bal) {
    balanceHistory.push(bal);
    if (balanceHistory.length > 100) balanceHistory.shift();
  }

  function recordRecommendation(llmAction, strategyAction) {
    llmTotal++;
    if (llmAction === strategyAction) llmCorrect++;
  }

  function getStats() {
    const total = wins + losses + pushes;
    return {
      wins, losses, pushes,
      winRate: total > 0 ? ((wins / (total - pushes)) * 100).toFixed(1) + '%' : '—',
      llmAccuracy: llmTotal > 0 ? ((llmCorrect / llmTotal) * 100).toFixed(1) + '%' : '—',
      biggestWin: biggestWin > 0 ? '$' + biggestWin : '—',
      biggestLoss: biggestLoss > 0 ? '$' + biggestLoss : '—',
      balanceHistory: [...balanceHistory],
    };
  }

  function renderBankrollChart(svgEl) {
    const hist = balanceHistory;
    if (hist.length < 2) {
      svgEl.innerHTML = '<text x="200" y="65" text-anchor="middle" fill="rgba(255,249,245,0.3)" font-size="12">Play some hands to see your bankroll history</text>';
      return;
    }

    const W = 400, H = 120, PAD = 20;
    const minVal = Math.min(...hist);
    const maxVal = Math.max(...hist);
    const range = Math.max(maxVal - minVal, 100);

    function px(i) { return PAD + (i / (hist.length - 1)) * (W - PAD * 2); }
    function py(v) { return PAD + (1 - (v - minVal) / range) * (H - PAD * 2); }

    const points = hist.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
    const areaPoints = `${px(0).toFixed(1)},${H - PAD} ${points} ${px(hist.length - 1).toFixed(1)},${H - PAD}`;

    svgEl.innerHTML = `
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFAA8A" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#F4A7C0" stop-opacity="0.05"/>
        </linearGradient>
      </defs>
      <polygon points="${areaPoints}" fill="url(#chartGrad)"/>
      <polyline points="${points}" fill="none" stroke="url(#lineGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#FFAA8A"/>
          <stop offset="100%" stop-color="#F4A7C0"/>
        </linearGradient>
      </defs>
      <text x="${W - PAD}" y="${py(hist[hist.length - 1]) - 6}" text-anchor="end" fill="#FF9472" font-size="11" font-weight="bold">$${hist[hist.length-1]}</text>
    `;
  }

  function reset() {
    wins = 0; losses = 0; pushes = 0;
    totalBet = 0; biggestWin = 0; biggestLoss = 0;
    llmCorrect = 0; llmTotal = 0;
    balanceHistory = [1000];
    currentBet = 0;
  }

  return { recordBet, recordResult, recordBalance, recordRecommendation, getStats, renderBankrollChart, reset };
})();
