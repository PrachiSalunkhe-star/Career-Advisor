function login(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include" // ✅ REQUIRED
  ,
    body: JSON.stringify({ email, password })
  })
  .then(async res => {

    // ✅ wait for cookie to be stored
    const data = await res.json();
    return data;
  })
  .then(data => {

    if (data.success) {

      alert("Login successful ✅");

      // ✅ optional (UI use only)
      localStorage.setItem("userLoggedIn", "true");
      localStorage.setItem("user_id", data.user_id);

      console.log("Login stored");

      // ✅ IMPORTANT: wait so browser saves cookie
      setTimeout(() => {
        window.location.replace("index.html");
      }, 500);

    } else {
      alert("Invalid login ❌");
    }

  })
  .catch(err => {
    console.error("Login error:", err);
    alert("Server error!");
  });
}