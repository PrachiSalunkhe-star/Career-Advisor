// ===============================
// IMPORTS
// ===============================
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");

dotenv.config();

const app = express();

/* =========================
   ✅ MIDDLEWARE
========================= */
app.use(cors({
  origin: "http://localhost:5500",
  credentials: true
}));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: "career-guidance-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60
  }
}));

app.use(express.static(
  path.join(__dirname, "../career-homepage")
));

// Helper to support non-cookie testing (localStorage based login fallback)
function getUserId(req) {
  return req.cookies?.user_id || req.query?.user_id || req.body?.user_id || req.headers['x-user-id'] || null;
}

/* =========================
   ✅ MYSQL CONNECTION
========================= */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "enter password ",
  database: "database name"
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

/* =========================
   ✅ AUTH ROUTES
========================= */

// SIGNUP
app.post("/api/auth/signup", async (req, res) => {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (full_name,email,password) VALUES (?,?,?)",
      [full_name, email, hashedPassword],
      (err) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
      }
    );
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.promise().query(
      "SELECT * FROM users WHERE email=?",
      [email]
    );

    if (rows.length === 0)
      return res.json({ success: false });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.json({ success: false });

    req.session.userId = user.id;

    res.cookie("user_id", user.id, {
      httpOnly: true,
      sameSite: "none",
      secure: false,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      user_id: user.id
    });

  } catch {
    res.status(500).json({ success: false });
  }
});

// LOGOUT
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("user_id");
    res.json({ success: true });
  });
});

/* =========================
   ✅ PROFILE CHECK
========================= */
app.get("/profile", (req, res) => {

  const userId = getUserId(req);

  if (!userId)
    return res.json({ loggedIn: false });

  res.json({
    loggedIn: true,
    userId
  });
});

/* =========================
   ✅ ASSESSMENT QUESTIONS
========================= */
app.get("/assessment/:level", (req, res) => {

  const level = req.params.level;

  const sql = `
    SELECT id, question,
           option_a, category_a,
           option_b, category_b,
           option_c, category_c,
           option_d, category_d
    FROM assessment_questions
    WHERE education_level = ?
    ORDER BY id ASC
  `;

  db.query(sql, [level], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

/* =========================
   ✅ SUBMIT ASSESSMENT
========================= */
app.post("/submit-assessment", async (req, res) => {

  try {
    const { user_id, education_level, answers } = req.body;

    if (!answers || answers.length === 0)
      return res.status(400).json({ error: "No answers" });

    // count categories
    const count = {};

    answers.forEach(cat => {
      count[cat] = (count[cat] || 0) + 1;
    });

    let topCategory = "";
    let max = 0;

    for (let cat in count) {
      if (count[cat] > max) {
        max = count[cat];
        topCategory = cat;
      }
    }

    const score = max * 10;

    // save result
    await db.promise().query(
      `INSERT INTO assessment_results
       (user_id, education_level, interest_category, score)
       VALUES (?, ?, ?, ?)`,
      [user_id, education_level, topCategory, score]
    );

    // get careers
    const [careers] = await db.promise().query(
      "SELECT * FROM careers WHERE category=?",
      [topCategory]
    );

    res.json({
      success: true,
      recommended_category: topCategory,
      score,
      careers
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   ✅ RECOMMENDED CAREERS
========================= */
app.get("/api/recommended-careers", (req, res) => {

  const userId = req.cookies.user_id;
  if (!userId) return res.status(401).json([]);

  const sql = `
    SELECT interest_category
    FROM assessment_results
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `;

  db.query(sql, [userId], (err, result) => {

    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.json([]);

    const category = result[0].interest_category;

    db.query(
      "SELECT * FROM careers WHERE category=? LIMIT 6",
      [category],
      (err, careers) => {

        if (err) return res.status(500).json(err);
        res.json(careers);
      }
    );
  });
});

/* =========================
   ✅ FAVORITE CAREERS ❤️
========================= */
app.post("/api/favorite-career", (req, res) => {

  const userId = getUserId(req);
  const { career_id } = req.body;

  if (!userId)
    return res.status(401).json({ message: "Login required" });

  if (!career_id)
    return res.status(400).json({ message: "career_id is required" });

  db.query(
    `INSERT IGNORE INTO user_favorite_careers
     (user_id, career_id)
     VALUES (?, ?)`,
    [userId, career_id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});


app.post("/api/favorite-college", (req, res) => {

  const userId = getUserId(req);
  const { collegeId } = req.body;

  if (!userId)
    return res.status(401).json({ message: "Login required" });

  if (!collegeId)
    return res.status(400).json({ message: "collegeId is required" });

  db.query(
    `INSERT IGNORE INTO user_favorite_colleges
     (user_id, college_id)
     VALUES (?, ?)`,
    [userId, collegeId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

/* =========================
   ✅ COLLEGES
========================= */
app.get("/colleges", (req, res) => {

  db.query("SELECT * FROM colleges", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

/* =========================
   ✅ ALL CAREERS
========================= */
app.get("/careers", (req, res) => {

  db.query("SELECT * FROM careers", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});



/* ===============================
   GET ASSESSMENT RESULT
================================ */

/* ===============================
   GET ASSESSMENT RESULT (DYNAMIC)
================================ */

app.get("/assessment-result/:userId", (req, res) => {

  const userId = req.params.userId;

  // 1️⃣ Get latest assessment result
  const resultQuery = `
    SELECT interest_category
    FROM assessment_results
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `;

  db.query(resultQuery, [userId], (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.json({
        stream: null,
        careers: []
      });
    }

    const stream = result[0].interest_category;

    // 2️⃣ Get careers automatically from careers table
    const careerQuery = `
      SELECT id, title, description, salary
      FROM careers
      WHERE category = ?
      LIMIT 8
    `;

    db.query(careerQuery, [stream], (err, careers) => {

      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Career fetch error" });
      }

      res.json({
        stream,
        careers
      });

    });

  });

});

/* ===============================
   ✅ FULL PROFILE DATA
================================ */

app.get("/api/profile-data", async (req, res) => {
  try {

    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Not logged in" });
    }

    // 1️⃣ Get user info
    const [user] = await db.promise().query(
      "SELECT id, full_name, email FROM users WHERE id = ?",
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2️⃣ Get latest assessment (FIXED TABLE NAME)
    const [assessment] = await db.promise().query(
      `SELECT interest_category, score 
       FROM assessment_results 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );

    // 3️⃣ Get favourite careers (if table exists)
    let favorites = [];
    try {
      const [result] = await db.promise().query(
        `SELECT careers.id, careers.title, careers.category 
         FROM user_favorite_careers 
         JOIN careers ON user_favorite_careers.career_id = careers.id
         WHERE user_favorite_careers.user_id = ?`,
        [userId]
      );
      favorites = result;
    } catch (err) {
      console.warn("Favourites query failed (might be missing table):", err.message);
      favorites = [];
    }

    // 4️⃣ Get favourite colleges (if table exists)
    let favoriteColleges = [];
    try {
      const [result] = await db.promise().query(
        `SELECT colleges.id, colleges.name, colleges.city, colleges.state, colleges.category
         FROM user_favorite_colleges
         JOIN colleges ON user_favorite_colleges.college_id = colleges.id
         WHERE user_favorite_colleges.user_id = ?`,
        [userId]
      );
      favoriteColleges = result;
    } catch (err) {
      console.warn("Favorite colleges query failed (might be missing table):", err.message);
      favoriteColleges = [];
    }

    // 5️⃣ Get profile details (phone/city)
    const [profile] = await db.promise().query(
      `SELECT phone, city, created_at, updated_at
       FROM profiles
       WHERE user_id = ?`,
      [userId]
    );

    res.json({
      user: user[0],
      profile: profile[0] || null,
      assessment: assessment[0] || null,
      favorites,
      favoriteColleges
    });

  } catch (error) {
    console.error("PROFILE API ERROR:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   ✅ PROFILE SAVE/UPDATE
========================= */
app.post("/api/profile", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Not logged in" });

    const { phone, city } = req.body;
    if (!phone && !city) {
      return res.status(400).json({ error: "Provide phone or city" });
    }

    await db.promise().query(
      `INSERT INTO profiles (user_id, phone, city, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         phone = VALUES(phone),
         city = VALUES(city),
         updated_at = NOW()`,
      [userId, phone || null, city || null]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("PROFILE SAVE ERROR:", error);
    res.status(500).json({ error: "Server error" });
  }
});


/* =========================
   ✅ SERVER START
========================= */
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
