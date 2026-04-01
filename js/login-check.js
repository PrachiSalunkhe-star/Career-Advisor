async function checkIfLoggedIn() {
  const res = await fetch("http://localhost:3000/api/auth/check", {
    credentials: "include"
  });

  const data = await res.json();

  if (data.loggedIn) {
    window.location.href = "profile.html";
  }
}

checkIfLoggedIn();
