// Test a batch of games
(async function() {
  const allGames = [...document.querySelectorAll('.game-card-mini')].map(c => c.dataset.game);
  const start = window._batchStart || 0;
  const batch = allGames.slice(start, start + 7);
  const results = [];

  // Make sure categories are expanded
  document.querySelectorAll('.category-header').forEach(h => {
    const cat = h.closest('.category');
    if (cat && cat.classList.contains('collapsed')) h.click();
  });
  await new Promise(r => setTimeout(r, 300));

  for (const game of batch) {
    const errors = [];
    const handler = (e) => errors.push(e.message);
    window.addEventListener('error', handler);
    try {
      const card = document.querySelector(`[data-game="${game}"]`);
      if (!card) { results.push({ game, status: 'missing' }); continue; }
      card.click();
      await new Promise(r => setTimeout(r, 1000));
      const gameArea = document.getElementById('gameArea');
      const hasContent = gameArea && gameArea.innerHTML.trim().length > 50;
      const canvas = document.querySelector('#gameArea canvas, #gameContainer canvas');
      if (errors.length > 0) {
        results.push({ game, status: 'error', errors: errors.slice() });
      } else if (!hasContent && !canvas) {
        results.push({ game, status: 'empty' });
      } else {
        results.push({ game, status: 'ok' });
      }
    } catch (e) {
      results.push({ game, status: 'crash', error: e.message });
    }
    window.removeEventListener('error', handler);
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) backBtn.click();
    await new Promise(r => setTimeout(r, 500));
  }
  return JSON.stringify(results);
})();
