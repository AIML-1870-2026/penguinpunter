const Blackjack = (() => {
  const SUITS = ['♠', '♥', '♦', '♣'];
  const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  let deck = [];
  let playerHands = [[]];
  let currentHandIdx = 0;
  let dealerHand = [];
  let balance = 1000;
  let currentBet = 0;
  let handBets = [0];
  let insuranceBet = 0;
  let gamePhase = 'idle';
  let dealerHoleVisible = false;
  let handResults = [];

  function cardValue(rank) {
    if (rank === 'A') return 11;
    if (['J', 'Q', 'K'].includes(rank)) return 10;
    return parseInt(rank);
  }

  function handTotal(hand) {
    let total = 0, aces = 0;
    for (const card of hand) {
      if (card.faceDown) continue;
      total += cardValue(card.rank);
      if (card.rank === 'A') aces++;
    }
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return total;
  }

  function isSoft(hand) {
    let total = 0, aces = 0;
    for (const card of hand) {
      if (card.faceDown) continue;
      total += cardValue(card.rank);
      if (card.rank === 'A') aces++;
    }
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return aces > 0 && total <= 21;
  }

  function isBlackjack(hand) {
    if (hand.length !== 2) return false;
    const faceUp = hand.filter(c => !c.faceDown);
    if (faceUp.length < 2) return false;
    return handTotal(faceUp) === 21;
  }

  function createDeck() {
    return SUITS.flatMap(suit => RANKS.map(rank => ({ rank, suit, faceDown: false })));
  }

  function shuffle(d) {
    const a = [...d];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function dealCard(faceDown = false) {
    if (deck.length === 0) deck = shuffle(createDeck());
    const card = { ...deck.pop(), faceDown };
    return card;
  }

  function newHand(bet) {
    if (!['idle', 'round_complete'].includes(gamePhase)) return false;
    if (!bet || bet <= 0 || bet > balance) return false;

    deck = shuffle(createDeck());
    playerHands = [[dealCard(), dealCard()]];
    currentHandIdx = 0;
    dealerHand = [dealCard(), dealCard(true)];
    currentBet = bet;
    handBets = [bet];
    insuranceBet = 0;
    balance -= bet;
    dealerHoleVisible = false;
    handResults = [];

    const playerBJ = isBlackjack(playerHands[0]);

    if (dealerHand[0].rank === 'A') {
      gamePhase = 'insurance_offered';
      return true;
    }

    // Peek for dealer blackjack on 10-value up card
    if (['10', 'J', 'Q', 'K'].includes(dealerHand[0].rank)) {
      const peek = handTotal([dealerHand[0], { ...dealerHand[1], faceDown: false }]);
      if (peek === 21) {
        dealerHand[1].faceDown = false;
        dealerHoleVisible = true;
        if (playerBJ) {
          balance += bet;
          handResults = ['push'];
        } else {
          handResults = ['lose'];
        }
        gamePhase = 'round_complete';
        return true;
      }
    }

    if (playerBJ) {
      dealerHand[1].faceDown = false;
      dealerHoleVisible = true;
      balance += bet + Math.floor(bet * 1.5);
      handResults = ['blackjack'];
      gamePhase = 'round_complete';
      return true;
    }

    gamePhase = 'player_turn';
    return true;
  }

  function takeInsurance(take) {
    if (gamePhase !== 'insurance_offered') return false;
    if (take) {
      const half = Math.floor(currentBet / 2);
      if (balance >= half) {
        insuranceBet = half;
        balance -= half;
      }
    }
    // Now peek at hole card
    dealerHand[1].faceDown = false;
    dealerHoleVisible = true;
    const dealerBJ = isBlackjack(dealerHand);
    const playerBJ = isBlackjack(playerHands[0]);

    if (insuranceBet > 0 && dealerBJ) {
      balance += insuranceBet * 3;
    }

    if (dealerBJ) {
      if (playerBJ) {
        balance += currentBet;
        handResults = ['push'];
      } else {
        handResults = ['lose'];
      }
      gamePhase = 'round_complete';
      return true;
    }

    // Dealer doesn't have BJ - hide hole card again, continue
    dealerHand[1].faceDown = true;
    dealerHoleVisible = false;

    if (playerBJ) {
      dealerHand[1].faceDown = false;
      dealerHoleVisible = true;
      balance += currentBet + Math.floor(currentBet * 1.5);
      handResults = ['blackjack'];
      gamePhase = 'round_complete';
      return true;
    }

    gamePhase = 'player_turn';
    return true;
  }

  function hit() {
    if (gamePhase !== 'player_turn') return false;
    playerHands[currentHandIdx].push(dealCard());
    if (handTotal(playerHands[currentHandIdx]) >= 21) advanceHand();
    return true;
  }

  function stand() {
    if (gamePhase !== 'player_turn') return false;
    advanceHand();
    return true;
  }

  function double() {
    if (gamePhase !== 'player_turn') return false;
    const hand = playerHands[currentHandIdx];
    if (hand.length !== 2) return false;
    const extra = handBets[currentHandIdx];
    if (balance < extra) return false;
    balance -= extra;
    handBets[currentHandIdx] *= 2;
    hand.push(dealCard());
    advanceHand();
    return true;
  }

  function split() {
    if (gamePhase !== 'player_turn') return false;
    const hand = playerHands[currentHandIdx];
    if (hand.length !== 2) return false;
    if (cardValue(hand[0].rank) !== cardValue(hand[1].rank)) return false;
    if (balance < handBets[currentHandIdx]) return false;
    const newBet = handBets[currentHandIdx];
    balance -= newBet;
    const c1 = hand[0], c2 = hand[1];
    playerHands[currentHandIdx] = [c1, dealCard()];
    playerHands.splice(currentHandIdx + 1, 0, [c2, dealCard()]);
    handBets.splice(currentHandIdx + 1, 0, newBet);
    return true;
  }

  function advanceHand() {
    currentHandIdx++;
    if (currentHandIdx >= playerHands.length) runDealer();
  }

  function runDealer() {
    gamePhase = 'dealer_turn';
    dealerHand[1].faceDown = false;
    dealerHoleVisible = true;
    while (handTotal(dealerHand) < 17) dealerHand.push(dealCard());
    resolveRound();
  }

  function resolveRound() {
    const dealerTotal = handTotal(dealerHand);
    const dealerBust = dealerTotal > 21;

    handResults = playerHands.map((hand, i) => {
      const playerTotal = handTotal(hand);
      const bet = handBets[i];
      if (playerTotal > 21) return 'lose';
      if (dealerBust) { balance += bet * 2; return 'win'; }
      if (playerTotal > dealerTotal) { balance += bet * 2; return 'win'; }
      if (playerTotal === dealerTotal) { balance += bet; return 'push'; }
      return 'lose';
    });

    gamePhase = 'round_complete';
  }

  function getState() {
    const idx = Math.min(currentHandIdx, playerHands.length - 1);
    const currentHand = playerHands[idx] || [];
    const total = handTotal(currentHand);
    const canDouble = gamePhase === 'player_turn' && currentHand.length === 2 && balance >= handBets[idx];
    const canSplit = gamePhase === 'player_turn' && currentHand.length === 2
      && cardValue(currentHand[0]?.rank) === cardValue(currentHand[1]?.rank)
      && balance >= handBets[idx];

    return {
      phase: gamePhase,
      playerHands,
      currentHandIdx: idx,
      dealerHand,
      dealerHoleVisible,
      playerTotal: total,
      dealerTotal: dealerHoleVisible ? handTotal(dealerHand) : handTotal([dealerHand[0]].filter(Boolean)),
      dealerUpCard: dealerHand[0]?.rank,
      balance,
      currentBet,
      handBets,
      handResults,
      isSoft: isSoft(currentHand),
      canHit: gamePhase === 'player_turn',
      canStand: gamePhase === 'player_turn',
      canDouble,
      canSplit,
      canInsurance: gamePhase === 'insurance_offered' && balance >= Math.floor(currentBet / 2),
    };
  }

  function getBalance() { return balance; }

  function resetBalance() {
    balance = 1000;
    gamePhase = 'idle';
    playerHands = [[]];
    dealerHand = [];
    handResults = [];
  }

  return { newHand, hit, stand, double, split, takeInsurance, getState, getBalance, resetBalance, handTotal, isSoft, cardValue };
})();
