// Explore page access
app.get("/explore", isAuthenticated, (req, res) => {
  res.json({ message: "Welcome to Explore Page" });
});

// Assessment page access
app.get("/assessment", isAuthenticated, (req, res) => {
  res.json({ message: "Welcome to Assessment Page" });
});

// Profile page access
app.get("/profile", isAuthenticated, (req, res) => {
  res.json({ message: "Welcome to Profile Page" });
});
