import { supabase } from "js/supabase.js";

window.resetPassword = async () => {
  const email = document.getElementById("email").value.trim();

  if (!email) {
    alert("Enter your email");
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:3000/career-homepage/update-password.html"
  });

  if (error) {
    alert(error.message);
  } else {
    alert("Password reset link sent 📧");
  }
};
