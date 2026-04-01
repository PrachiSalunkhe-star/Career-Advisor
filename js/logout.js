function logout() {
  fetch("http://localhost:3000/api/auth/logout", {
    credentials: "include"
  })
  .then(() => {
    window.location.href = "login.html";
  });
}
