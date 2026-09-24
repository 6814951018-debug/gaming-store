const test = require('node:test');
const assert = require('node:assert/strict');
const { getFallbackGames } = require('../src/controllers/game.controller');

test('fallback catalog includes the storefront game list when the database is unavailable', () => {
  const games = getFallbackGames({});

  assert.ok(Array.isArray(games));
  assert.ok(games.length >= 3);
  assert.equal(games[0].title, 'ELDEN RING');
  assert.equal(games[1].title, 'Clair Obscur: Expedition 33');
  assert.ok(games.some((game) => game.title === 'Forza Horizon 6'));
  const requiem = games.find((game) => game.title === 'Resident Evil Requiem');
  assert.ok(requiem);
  assert.equal(requiem.releaseYear, 2026);
  assert.match(requiem.imageUrl, /steamgriddb\.com\/grid/);
});
