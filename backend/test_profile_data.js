const fetch = require('node-fetch');
(async () => {
  try {
    const r = await fetch('http://localhost:3000/api/profile-data?user_id=1');
    console.log('status', r.status);
    const t = await r.text();
    console.log(t);
  } catch (e) {
    console.error(e);
  }
})();