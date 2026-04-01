document.addEventListener("DOMContentLoaded", async () => {

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  try {
    // ✅ check backend session
    const res = await fetch("http://localhost:3000/profile", {
      credentials: "include"
    });

    const data = await res.json();

    if (data.loggedIn) {
      // USER LOGGED IN
      if (loginBtn) loginBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "inline-block";
    } else {
      showLogin();
    }

  } catch (err) {
    showLogin();
  }

  // ✅ logout action
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {

      await fetch("http://localhost:3000/logout", {
        method: "GET",
        credentials: "include"
      });

      localStorage.removeItem("userLoggedIn");
      localStorage.removeItem("user_id");

      window.location.href = "index.html";
    });
  }

  function showLogin() {
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
  }

});