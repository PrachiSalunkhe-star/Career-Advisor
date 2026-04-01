const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/:userId", (req, res) => {
  db.query(
    `SELECT colleges.id, colleges.name, colleges.city
     FROM user_favorite_colleges
     JOIN colleges ON colleges.id=user_favorite_colleges.college_id
     WHERE user_favorite_colleges.user_id=?`,
    [req.params.userId],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

router.post("/remove", (req, res) => {
  const { user_id, college_id } = req.body;

  db.query(
    "DELETE FROM user_favorite_colleges WHERE user_id=? AND college_id=?",
    [user_id, college_id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Removed" });
    }
  );
});

module.exports = router;
