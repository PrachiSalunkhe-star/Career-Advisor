// ===============================
// 🚀 PROFILE PAGE - PROFESSIONAL VERSION
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  setupLogout();
});


// ===============================
// 1️⃣ CHECK AUTHENTICATION
// ===============================
async function checkAuth() {
  try {
    const response = await fetch("http://localhost:3000/profile", {
      method: "GET",
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Auth request failed");
    }

    const data = await response.json();

    if (!data.loggedIn) {
      setAuthUI(false);
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        redirectToLogin();
        return;
      }
      console.log("Auth cookie missing, using localStorage user_id fallback", userId);
      await loadProfileData(userId);
      setAuthUI(true);
      return;
    }

    setAuthUI(true);
    // ✅ Logged in → load profile
    await loadProfileData();

  } catch (error) {
    console.error("Auth check failed:", error);
    setAuthUI(false);
    redirectToLogin();
  }
}


// ===============================
// 2️⃣ LOAD PROFILE DATA
// ===============================
async function loadProfileData(fallbackUserId = null) {

  try {

    const url = fallbackUserId
      ? `http://localhost:3000/api/profile-data?user_id=${encodeURIComponent(fallbackUserId)}`
      : "http://localhost:3000/api/profile-data";

    const response = await fetch(
      url,
      {
        method: "GET",
        credentials: "include"
      }
    );

    if (!response.ok) {
      throw new Error("Profile API failed");
    }

    const data = await response.json();
    console.log("profile-data response", data);

    if (!data || !data.user) {
      console.error("User data not found");
      showErrorMessage("Profile data not available.");
      return;
    }

    renderUserInfo(data.user);
    renderProfile(data.profile);
    renderAssessment(data.assessment);
    renderFavorites(data.favorites);
    renderFavoriteColleges(data.favoriteColleges);

    setupProfileSaver();
    setupAvatarControls();

  } catch (error) {
    console.error("Profile loading error:", error);
    showErrorMessage("Failed to load profile data.");
  }
}


// ===============================
// 👤 RENDER USER INFO
// ===============================
function renderUserInfo(user) {

  const nameEl = document.getElementById("userName");
  const emailEl = document.getElementById("userEmail");
  const userCityEl = document.getElementById("userCity");

  if (nameEl)
    nameEl.textContent = user.full_name || "Not Available";

  if (emailEl)
    emailEl.textContent = user.email || "Not Available";

  if (userCityEl)
    userCityEl.textContent = "City: -";

  // Apply saved avatar if exists
  const avatarData = localStorage.getItem("profileAvatar");
  if (avatarData) {
    setAvatarImage(avatarData);
  }
}


// ===============================
// 📊 RENDER ASSESSMENT
// ===============================
function renderAssessment(assessment) {

  const streamName = document.getElementById("streamName");
  const streamScore = document.getElementById("streamScore");
  const progressFill = document.getElementById("progressFill");

  const userEducation = document.getElementById("userEducation");

  if (!assessment) {
    if (streamName)
      streamName.textContent = "No assessment yet";

    if (streamScore)
      streamScore.textContent = "";

    if (progressFill)
      progressFill.style.width = "0%";

    if (userEducation)
      userEducation.textContent = "Education: -";

    return;
  }

  if (streamName)
    streamName.textContent =
      assessment.interest_category || "Not Available";

  if (streamScore)
    streamScore.textContent =
      (assessment.score || 0) + "%";

  if (progressFill)
    progressFill.style.width =
      (assessment.score || 0) + "%";

  if (userEducation)
    userEducation.textContent =
      `Recommended: ${assessment.interest_category || "-"}`;
}


// ===============================
// ❤️ RENDER FAVORITES
// ===============================
function renderFavorites(favorites) {

  const favContainer =
    document.getElementById("favoritesContainer");

  if (!favContainer) return;

  favContainer.innerHTML = "";

  if (!favorites || favorites.length === 0) {
    favContainer.innerHTML =
      "<p>No favorite careers yet.</p>";
    return;
  }

  favorites.forEach(career => {

    const div = document.createElement("div");
    div.className = "favorite-item";
    div.textContent = "❤️ " + career.title;

    favContainer.appendChild(div);
  });
}


// ===============================
// 🏫 RENDER FAVORITE COLLEGES
// ===============================
function renderFavoriteColleges(colleges) {
  const container = document.getElementById("favoriteCollegesContainer");

  if (!container) return;

  container.innerHTML = "";

  if (!colleges || colleges.length === 0) {
    container.innerHTML = "<p>No favorite colleges yet.</p>";
    return;
  }

  colleges.forEach(college => {
    const div = document.createElement("div");
    div.className = "favorite-item";
    div.innerHTML = `<strong>${college.name}</strong><br/>${college.city}, ${college.state}`;
    container.appendChild(div);
  });
}


// ===============================
// 2.1️⃣ RENDER PROFILE EDIT FORM
// ===============================
function renderProfile(profile) {
  const phoneInput = document.getElementById("phoneInput");
  const cityInput = document.getElementById("cityInput");
  const userCityEl = document.getElementById("userCity");

  if (phoneInput)
    phoneInput.value = profile?.phone || "";

  if (cityInput) {
    cityInput.value = profile?.city || "";
    if (userCityEl)
      userCityEl.textContent = `City: ${profile?.city || "-"}`;
  }
}


// ===============================
// 2.2️⃣ SAVE PROFILE
// ===============================
function setupProfileSaver() {
  const form = document.getElementById("profileForm");
  const message = document.getElementById("profileMessage");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const phone = document.getElementById("phoneInput").value.trim();
    const city = document.getElementById("cityInput").value.trim();

    try {
      const bodyData = { phone, city };
      const fallbackUserId = localStorage.getItem("user_id");
      if (fallbackUserId) bodyData.user_id = fallbackUserId;

      const res = await fetch("http://localhost:3000/api/profile", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });

      if (!res.ok) throw new Error("Could not save profile");

      message.textContent = "Profile saved successfully.";
      message.style.color = "green";

      // refresh profile details
      await loadProfileData();

    } catch (e) {
      console.error("Profile save error", e);
      message.textContent = "Error saving profile. Please try again.";
      message.style.color = "red";
    }
  });
}


// ===============================
// Auth button state
// ===============================
function setAuthUI(loggedIn) {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (loginBtn) loginBtn.style.display = loggedIn ? "none" : "inline-block";
  if (logoutBtn) logoutBtn.style.display = loggedIn ? "inline-block" : "none";
}


// ===============================
// 3️⃣ LOGOUT
// ===============================
function setupLogout() {

  const logoutBtn =
    document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async () => {

    try {

      await fetch("http://localhost:3000/logout", {
        method: "GET",
        credentials: "include"
      });

    } catch (error) {
      console.error("Logout failed:", error);
    }

    redirectToLogin();
  });
}


// ===============================
// 4️⃣ ERROR DISPLAY
// ===============================
function showErrorMessage(message) {

  const container = document.querySelector(".profile-container");

  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center; padding:40px;">
      <h3>${message}</h3>
    </div>
  `;
}


// ===============================
// 5️⃣ REDIRECT
// ===============================
function redirectToLogin() {
  window.location.replace("login.html");
}


// ===============================
// Avatar helper
// ===============================
function setAvatarImage(dataUrl) {
  const avatarCircle = document.getElementById("avatarCircle");
  if (!avatarCircle) return;

  avatarCircle.innerHTML = `<img src="${dataUrl}" alt="Avatar">`;
  avatarCircle.style.background = "none";
}

function setupAvatarControls() {
  const uploadBtn = document.getElementById("uploadAvatarBtn");
  const captureBtn = document.getElementById("captureAvatarBtn");
  const fileInput = document.getElementById("avatarFileInput");

  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        setAvatarImage(reader.result);
        localStorage.setItem("profileAvatar", reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  if (captureBtn) {
    captureBtn.addEventListener("click", async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("Camera capture is not supported on this device.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement("video");
        video.srcObject = stream;
        video.play();

        const modal = document.createElement("div");
        modal.className = "avatar-capture-modal";
        modal.innerHTML = `
          <div class="avatar-capture-content">
            <video autoplay playsinline></video>
            <div class="avatar-capture-actions">
              <button id="avatarCaptureBtn">Capture</button>
              <button id="avatarCancelBtn">Cancel</button>
            </div>
          </div>
        `;

        document.body.appendChild(modal);
        modal.querySelector("video").srcObject = stream;

        modal.querySelector("#avatarCaptureBtn").addEventListener("click", () => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext("2d").drawImage(video, 0, 0);

          const imageData = canvas.toDataURL("image/png");
          setAvatarImage(imageData);
          localStorage.setItem("profileAvatar", imageData);

          stream.getTracks().forEach(track => track.stop());
          modal.remove();
        });

        modal.querySelector("#avatarCancelBtn").addEventListener("click", () => {
          stream.getTracks().forEach(track => track.stop());
          modal.remove();
        });

      } catch (error) {
        console.error(error);
        alert("Failed to access camera.");
      }
    });
  }
}
