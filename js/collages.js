document.addEventListener("DOMContentLoaded", async function () {

  console.log("Checking authentication...");

  // ===============================
  // ✅ BACKEND AUTH CHECK
  // ===============================
  try {
    const authRes = await fetch("http://localhost:3000/profile", {
      method: "GET",
      credentials: "include"
    });

    const authData = await authRes.json();

    if (!authData.loggedIn) {
      window.location.href = "login.html";
      return;
    }

    console.log("User authenticated ✅");

  } catch (error) {
    console.error("Auth check failed:", error);
    window.location.href = "login.html";
    return;
  }

  // ===============================
  // PAGE LOGIC STARTS AFTER LOGIN
  // ===============================

  const grid = document.getElementById("collegesGrid");
  const searchInput = document.getElementById("searchInput");
  const cityFilter = document.getElementById("cityFilter");  const typeFilter = document.getElementById("typeFilter");
  const resetBtn = document.getElementById("resetFilters");

  let colleges = [];

  // ===============================
  // LOAD COLLEGES
  // ===============================
  async function loadColleges() {
    try {
      const response = await fetch("http://localhost:3000/colleges", {
        credentials: "include"
      });

      colleges = await response.json();

      populateCities();
      renderColleges(colleges);

    } catch (error) {
      console.error("Error loading colleges:", error);
      grid.innerHTML = "<p>Server not connected.</p>";
    }
  }

  // ===============================
  // POPULATE CITY FILTER
  // ===============================
function populateCities() {
  cityFilter.innerHTML = `<option value="">All Cities</option>`;

  const cities = [...new Set(
    colleges.map(c => c.city).filter(Boolean)
  )];

  cities.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    cityFilter.appendChild(option);
  });
}

  // ===============================
  // RENDER COLLEGES
  // ===============================
  function renderColleges(list) {
    grid.innerHTML = "";

    if (list.length === 0) {
      grid.innerHTML = "<p>No colleges found.</p>";
      return;
    }

    list.forEach(college => {
      const card = document.createElement("div");
      card.className = "college-card";

      card.innerHTML = `
        <img src="${college.image_url || 'https://via.placeholder.com/300'}">
        <div class="college-info">
          <h3>${college.name || "No Name"}</h3>
          <p>${college.city || ""}, ${college.state || ""}</p>
          <p><strong>${college.category || ""}</strong></p>
          <p>Fees: ₹ ${college.annual_fees || "N/A"}</p>

          ${college.website_url ? `
                    <a href="${college.website_url}" target="_blank">
                      <a href="${college.website_url}" target="_blank">
          <button class="visit-btn">Visit</button>
        </a>

        <button class="fav-btn"
          onclick="saveCollege(${college.id}, this)">
          ❤️ Save
        </button>
            </a>
          ` : ""}
        </div>
      `;

      grid.appendChild(card);
    });
  }

  // ===============================
  // FILTERS
  // ===============================
  function applyFilters() {
  const search = searchInput.value.toLowerCase();
  const city = cityFilter.value;
  const type = typeFilter.value;

  const filtered = colleges.filter(c =>
    (c.name?.toLowerCase().includes(search)) &&
    (city === "" || c.city === city) &&
    (type === "" || c.category === type)
  );

  renderColleges(filtered);
}

  resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    cityFilter.value = "";
    typeFilter.value = "";
    renderColleges(colleges);
  });

  searchInput.addEventListener("input", applyFilters);
  cityFilter.addEventListener("change", applyFilters);
  typeFilter.addEventListener("change", applyFilters);

  loadColleges();
});

// ===============================
// SAVE COLLEGE FAVORITE
// ===============================
async function saveCollege(collegeId, btn) {

  try {

    const res = await fetch(
      "http://localhost:3000/api/favorite-college",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ collegeId })
      }
    );

    const data = await res.json();

    if (data.success) {
      if (btn) {
        btn.textContent = "★ Saved";
        btn.classList.add("saved");
      }
      alert("❤️ College saved to favorites!");
    } else {
      alert("Login required");
    }

  } catch (err) {
    console.error(err);
  }
}