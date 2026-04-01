const fetch = require('node-fetch');
(async () => {
  try {
    const r = await fetch('http://localhost:3000/api/favorite-college?user_id=1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collegeId: 1 }),
    });
    console.log('status', r.status);
    console.log(await r.text());
  } catch (e) {
    console.error(e);
  }
})();