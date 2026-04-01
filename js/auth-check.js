document.addEventListener("DOMContentLoaded", async () => {

  const response = await fetch("http://localhost:3000/profile", {
    credentials: "include"
  });

  const data = await response.json();

  if (!data.loggedIn) {
    window.location.href = "login.html";
  }

});