const Strategy = (() => {
  // Columns index: dealer 2,3,4,5,6,7,8,9,10,A → 0-9
  function dealerIdx(rank) {
    if (rank === 'A') return 9;
    const v = ['J', 'Q', 'K'].includes(rank) ? 10 : parseInt(rank);
    return Math.min(v - 2, 8);
  }

  // H=Hit, S=Stand, D=Double (else Hit), Ds=Double (else Stand), P=Split
  const HARD = {
    4:  'HHHHHHHHHH',
    5:  'HHHHHHHHHH',
    6:  'HHHHHHHHHH',
    7:  'HHHHHHHHHH',
    8:  'HHHHHHHHHH',
    9:  'HDDDDHHHHH',
    10: 'DDDDDDDDHH',
    11: 'DDDDDDDDDH',
    12: 'HHSSSHHHHH',
    13: 'SSSSSHHHHH',
    14: 'SSSSSHHHHH',
    15: 'SSSSSHHHHH',
    16: 'SSSSSHHHHH',
    17: 'SSSSSSSSSS',
    18: 'SSSSSSSSSS',
    19: 'SSSSSSSSSS',
    20: 'SSSSSSSSSS',
    21: 'SSSSSSSSSS',
  };

  // Soft totals (hand includes an ace counted as 11)
  // Total = 13 means A,2; 14 = A,3; ... 20 = A,9; 21 = A,10 (would be blackjack)
  const SOFT = {
    13: 'HHHDDHHHHH',
    14: 'HHHDDHHHHH',
    15: 'HHDDDHHHHH',
    16: 'HHDDDHHHHH',
    17: 'HDDDDHHHHH',
    18: 'SDDDDSSHHH',
    19: 'SSSSSSSSSS',
    20: 'SSSSSSSSSS',
  };

  // Pairs — key is the card value (2–10 + 11 for Ace)
  const PAIRS = {
    2:  'PPPPPPHHHHH',
    3:  'PPPPPPHHHHH',
    4:  'HHHPPHHHHH',
    5:  'DDDDDDDDHH',
    6:  'PPPPPHHHHHH',
    7:  'PPPPPPPHHH',
    8:  'PPPPPPPPPP',
    9:  'PPPPPSPPSS',
    10: 'SSSSSSSSSS',
    11: 'PPPPPPPPPP',
  };

  function getAction(state) {
    const { playerHands, currentHandIdx, dealerUpCard, canDouble, canSplit } = state;
    const hand = playerHands[currentHandIdx];
    if (!hand || !dealerUpCard) return 'hit';

    const dIdx = dealerIdx(dealerUpCard);
    const total = Blackjack.handTotal(hand);
    const soft = Blackjack.isSoft(hand);

    // Check pairs first
    if (hand.length === 2 && canSplit) {
      const v1 = Blackjack.cardValue(hand[0].rank);
      const v2 = Blackjack.cardValue(hand[1].rank);
      if (v1 === v2) {
        const pairKey = v1 === 11 ? 11 : Math.min(v1, 10);
        const row = PAIRS[pairKey];
        if (row) {
          const ch = row[Math.min(dIdx, row.length - 1)];
          if (ch === 'P') return 'split';
          if (ch === 'D') return canDouble ? 'double' : 'hit';
          if (ch === 'S') return 'stand';
          return 'hit';
        }
      }
    }

    // Soft hands
    if (soft && SOFT[total]) {
      const row = SOFT[total];
      const ch = row[Math.min(dIdx, row.length - 1)];
      if (ch === 'H') return 'hit';
      if (ch === 'S' || ch === 's') return 'stand';
      if (ch === 'D') return canDouble ? 'double' : 'hit';
      if (ch === 'd') return canDouble ? 'double' : 'stand';
    }

    // Hard totals
    const key = Math.min(Math.max(total, 4), 21);
    const row = HARD[key];
    if (row) {
      const ch = row[Math.min(dIdx, row.length - 1)];
      if (ch === 'H') return 'hit';
      if (ch === 'S') return 'stand';
      if (ch === 'D') return canDouble ? 'double' : 'hit';
    }

    return total >= 17 ? 'stand' : 'hit';
  }

  function getFullTable() {
    return { HARD, SOFT, PAIRS, dealerIdx };
  }

  const DEALER_LABELS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];
  const ACTION_COLORS = { H: '#FFAA8A', S: '#F4A7C0', D: '#A8C8F0', P: '#C8A8F0', d: '#A8C8F0' };
  const ACTION_LABELS = { H: 'H', S: 'S', D: 'D', P: 'P', d: 'D', s: 'S' };

  function renderChart(chartType, activeState) {
    const table = document.createElement('table');
    table.className = 'strategy-table';

    let rows = [];
    let rowLabels = [];

    if (chartType === 'hard') {
      for (let t = 4; t <= 21; t++) {
        rows.push(HARD[t] || 'SSSSSSSSSS');
        rowLabels.push(String(t));
      }
    } else if (chartType === 'soft') {
      const softTotals = [13, 14, 15, 16, 17, 18, 19, 20];
      const softNames = ['A,2', 'A,3', 'A,4', 'A,5', 'A,6', 'A,7', 'A,8', 'A,9'];
      softTotals.forEach((t, i) => {
        rows.push(SOFT[t] || 'SSSSSSSSSS');
        rowLabels.push(softNames[i]);
      });
    } else {
      const pairKeys = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      const pairNames = ['2,2', '3,3', '4,4', '5,5', '6,6', '7,7', '8,8', '9,9', '10,10', 'A,A'];
      pairKeys.forEach((k, i) => {
        const row = PAIRS[k] || 'HHHHHHHHHH';
        rows.push(row.slice(0, 10).padEnd(10, 'H'));
        rowLabels.push(pairNames[i]);
      });
    }

    // Determine active cell
    let activeRow = -1, activeCol = -1;
    if (activeState && activeState.phase === 'player_turn') {
      const { playerHands, currentHandIdx, dealerUpCard, isSoft } = activeState;
      const hand = playerHands[currentHandIdx];
      if (hand && dealerUpCard) {
        activeCol = dealerIdx(dealerUpCard);
        if (chartType === 'hard') {
          const total = Blackjack.handTotal(hand);
          activeRow = Math.max(0, Math.min(total - 4, rows.length - 1));
        } else if (chartType === 'soft' && isSoft) {
          const total = Blackjack.handTotal(hand);
          const softTotals = [13, 14, 15, 16, 17, 18, 19, 20];
          activeRow = softTotals.indexOf(total);
        } else if (chartType === 'pairs') {
          if (hand.length === 2) {
            const v1 = Blackjack.cardValue(hand[0].rank);
            const v2 = Blackjack.cardValue(hand[1].rank);
            if (v1 === v2) {
              const pairKey = v1 === 11 ? 11 : Math.min(v1, 10);
              const pairKeys = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
              activeRow = pairKeys.indexOf(pairKey);
            }
          }
        }
      }
    }

    // Header row
    const thead = document.createElement('thead');
    const hRow = document.createElement('tr');
    const cornerTh = document.createElement('th');
    cornerTh.textContent = 'Player \\ Dealer';
    hRow.appendChild(cornerTh);
    DEALER_LABELS.forEach(lbl => {
      const th = document.createElement('th');
      th.textContent = lbl;
      hRow.appendChild(th);
    });
    thead.appendChild(hRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    rows.forEach((rowStr, rIdx) => {
      const tr = document.createElement('tr');
      const rowTh = document.createElement('th');
      rowTh.textContent = rowLabels[rIdx];
      tr.appendChild(rowTh);
      for (let cIdx = 0; cIdx < 10; cIdx++) {
        const ch = rowStr[cIdx] || 'H';
        const td = document.createElement('td');
        td.textContent = ACTION_LABELS[ch] || ch;
        td.style.background = ACTION_COLORS[ch] || '#ff6b35';
        if (rIdx === activeRow && cIdx === activeCol) {
          td.classList.add('active-cell');
        }
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    return table;
  }

  return { getAction, getFullTable, renderChart, DEALER_LABELS, ACTION_COLORS };
})();
