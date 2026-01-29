// Automated game tester - run in browser console
(async function testAllGames() {
  const games = [...document.querySelectorAll('.game-card-mini')].map(c => c.dataset.game);
  const results = [];

  for (const game of games) {
    // Clear error tracking
    const errors = [];
    const handler = (e) => errors.push(e.message);
    window.addEventListener('error', handler);

    try {
      // Launch game
      const card = document.querySelector(`[data-game="${game}"]`);
      if (!card) { results.push({ game, status: 'missing' }); continue; }
      card.click();

      // Wait for render
      await new Promise(r => setTimeout(r, 1000));

      // Check for content
      const gameArea = document.getElementById('game-area');
      const hasContent = gameArea && gameArea.innerHTML.trim().length > 50;
      const canvas = document.querySelector('#game-area canvas');

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

    // Go back
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) backBtn.click();
    await new Promise(r => setTimeout(r, 500));
  }

  window._testResults = results;
  return results;
})();
