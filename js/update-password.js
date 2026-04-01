window.updatePassword = async () => {
  const password = document.getElementById("password").value;

  if (!password) {
    alert("Enter new password");
    return;
  }

  const res = await fetch("/api/auth/update-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message);
    return;
  }

  alert("Password updated ✅");
  window.location.href = "login.html";
};
