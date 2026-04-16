const Agent = (() => {
  const RISK_PROMPTS = {
    conservative: 'You prefer conservative play: avoid doubles and splits when risky, minimize variance. Prioritize not losing over maximizing gains.',
    balanced: 'You follow standard basic strategy. Balance risk and reward according to the mathematically optimal play.',
    aggressive: 'You play aggressively: take doubles and splits when expected value is favorable, even with higher variance. Chase positive EV situations.',
  };

  const EXPLAIN_PROMPTS = {
    basic: 'Respond with one sentence: state your recommended action and a brief reason.',
    statistical: 'Include the recommended action, the approximate bust probability, and the expected value comparison between your top two options.',
    indepth: 'Provide the recommended action, full reasoning chain, bust probabilities, expected value analysis, and compare your recommendation to basic strategy. Explain why you agree or disagree with the textbook play.',
  };

  function buildPrompt(state, riskLevel, explainLevel) {
    const { playerHands, currentHandIdx, dealerUpCard, playerTotal, isSoft, canDouble, canSplit, canInsurance, handBets } = state;
    const hand = playerHands[currentHandIdx];
    if (!hand) return { prompt: '', systemPrompt: '' };

    const handStr = hand.map(c => c.rank + c.suit).join(' ');
    const softLabel = isSoft ? ' (soft)' : '';

    const legalActions = [];
    if (state.canHit) legalActions.push('hit');
    if (state.canStand) legalActions.push('stand');
    if (canDouble) legalActions.push('double');
    if (canSplit) legalActions.push('split');
    if (canInsurance) legalActions.push('insurance');

    const systemPrompt = [
      'You are an expert blackjack strategy advisor.',
      RISK_PROMPTS[riskLevel] || RISK_PROMPTS.balanced,
      EXPLAIN_PROMPTS[explainLevel] || EXPLAIN_PROMPTS.basic,
      'Always end your response by clearly stating your final recommendation using a directive phrase like "I recommend", "you should", or "the best move is".',
    ].join(' ');

    const prompt = [
      `Current blackjack hand:`,
      `- Player hand: ${handStr} (total: ${playerTotal}${softLabel})`,
      `- Dealer up card: ${dealerUpCard}`,
      `- Legal actions: ${legalActions.join(', ')}`,
      `- Current bet: $${handBets[currentHandIdx]}`,
      ``,
      `What is the best action? ${EXPLAIN_PROMPTS[explainLevel]}`,
    ].join('\n');

    return { prompt, systemPrompt };
  }

  function parseRecommendation(text, state) {
    const lower = text.toLowerCase();
    const actions = ['double', 'split', 'insurance', 'stand', 'hit'];

    // Filter to only legal actions if state provided
    const legal = state ? actions.filter(a => {
      if (a === 'hit') return state.canHit;
      if (a === 'stand') return state.canStand;
      if (a === 'double') return state.canDouble;
      if (a === 'split') return state.canSplit;
      if (a === 'insurance') return state.canInsurance;
      return false;
    }) : actions;

    // Look for directive phrases — action word immediately following
    const directivePattern = /\b(?:i (?:would |strongly )?recommend(?:ation is)?|you should|you ought to|the best (?:move|play|action|option) (?:is|would be)|i suggest|my (?:recommendation|suggestion) is|the (?:correct|optimal|right) (?:move|play|action) is|best move:?|recommend:?)\s+(?:to\s+)?(\w+)/i;
    const directiveMatch = lower.match(directivePattern);
    if (directiveMatch) {
      const word = directiveMatch[1];
      for (const action of legal) {
        if (word === action || word.startsWith(action)) return action;
      }
    }

    // Fallback: last-mentioned action in the text
    // "hit or stand" → "stand" wins (last mentioned)
    let lastIdx = -1;
    let lastAction = legal[legal.length - 1] || 'stand';
    for (const action of legal) {
      const pattern = new RegExp(`\\b${action}\\b`, 'gi');
      let m;
      let idx = -1;
      while ((m = pattern.exec(lower)) !== null) idx = m.index;
      if (idx > lastIdx) { lastIdx = idx; lastAction = action; }
    }

    return lastAction;
  }

  return { buildPrompt, parseRecommendation };
})();
