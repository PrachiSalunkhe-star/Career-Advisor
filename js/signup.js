window.signup = async () => {
  const full_name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!full_name || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",   // 🔥 REQUIRED FOR SESSION
      body: JSON.stringify({ full_name, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Signup failed");
      return;
    }

    alert("Signup successful 🎉");

    window.location.href = "profile.html";

  } catch (error) {
    console.error(error);
    alert("Server error. Make sure backend is running.");
  }
};
