const mysql = require('mysql2');
const db = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'eduguide_72747576',
  database:'eduguide'
});
const userId = 1;
const ops = [
  ['SELECT id, full_name, email FROM users WHERE id=?', [userId]],
  ['SELECT interest_category, score FROM assessment_results WHERE user_id=? ORDER BY created_at DESC LIMIT 1', [userId]],
  ['SELECT careers.id, careers.title, careers.category FROM user_favorite_careers JOIN careers ON user_favorite_careers.career_id = careers.id WHERE user_favorite_careers.user_id = ?', [userId]],
  ['SELECT colleges.id, colleges.name, colleges.city, colleges.state, colleges.category FROM user_favorite_colleges JOIN colleges ON user_favorite_colleges.college_id = colleges.id WHERE user_favorite_colleges.user_id = ?', [userId]],
  ['SELECT phone, city, created_at, updated_at FROM profiles WHERE user_id = ?', [userId]]
];
(async () => {
  const p = db.promise();
  for (const [sql, params] of ops) {
    try {
      const [res] = await p.query(sql, params);
      console.log('OK', sql, '=>', res.length, res[0] || null);
    } catch (err) {
      console.error('ERR', sql, err.message);
    }
  }
  db.end();
})();
