const container = document.getElementById("careerContainer");
const params = new URLSearchParams(window.location.search);
const career = params.get("career");

console.log("Selected Career:", career);
let careers = [];

/* LOAD FROM BACKEND */
async function loadCareers() {

  const res = await fetch("http://localhost:3000/careers");
  careers = await res.json();

  displayCareers();
}

function displayCareers() {

  container.innerHTML = "";

  careers.forEach((career, index) => {

    container.innerHTML += `
      <div class="card">
        <img src="${career.image}">
        <div class="card-content">

          <div class="card-header">
            <span class="tag">${career.category}</span>
            <button class="favorite-star" onclick="saveFavorite(${career.id}, this)">☆</button>
          </div>

          <h3>${career.title}</h3>
          <p>${career.description}</p>

          <p>Salary:
            <span class="salary">${career.salary}</span>
          </p>

          <p>Growth:
            <span class="growth">${career.growth}</span>
          </p>

          <button class="btn" onclick="openModal(${index})">
            View Details
          </button>

        </div>
      </div>
    `;
  });
}


/* MODAL */
function openModal(i) {

  const career = careers[i];

  document.getElementById("careerModal").style.display = "block";
  document.getElementById("modalTitle").innerText = career.title;
  document.getElementById("modalImage").src = career.image;

  // convert string → array
  const courses = career.courses.split(",");
  const skills = career.skills.split(",");
  const industries = career.industries.split(",");

  document.getElementById("modalCourses").innerHTML =
    courses.map(c => `<li>${c}</li>`).join("");

  document.getElementById("modalSkills").innerHTML =
    skills.map(s => `<span>${s}</span>`).join("");

  document.getElementById("modalIndustries").innerHTML =
    industries.map(i => `<li>${i}</li>`).join("");
}

function closeModal() {
  document.getElementById("careerModal").style.display = "none";
}

window.onload = loadCareers;

document.getElementById("aptitudeBtn")
  .addEventListener("click", () => {
    const careerName =
    document.getElementById("modalTitle").innerText;


    // redirect to assessment page
    window.location.href = "assesment.html";

});
function goToColleges() {
  window.location.href = "collages.html";
}

async function saveFavorite(careerId, btn) {
  try {
    const response = await fetch("http://localhost:3000/api/favorite-career", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ career_id: careerId })
    });

    if (!response.ok) {
      throw new Error("Failed to save favorite");
    }

    const data = await response.json();
    if (data.success) {
      if (btn) {
        btn.textContent = "★ Saved";
        btn.classList.add("saved");
      }
      alert("Career added to favorites");
    } else {
      alert("Unable to save favourite career. Please login.");
    }

  } catch (err) {
    console.error(err);
    alert("Error saving favourite career.");
  }
}

async function loadRecommendedCareers() {

  try {

    const res = await fetch(
      "http://localhost:3000/api/recommended-careers",
      { credentials: "include" }
    );

    if (!res.ok) return;

    const careers = await res.json();

    const container =
      document.getElementById("recommendedCareers");

    container.innerHTML = "";

    if (careers.length === 0) {
      container.innerHTML =
        "<p>Complete assessment to see recommendations.</p>";
      return;
    }

    careers.forEach(career => {

      const card = document.createElement("div");
      card.className = "career-card";

      card.innerHTML = `
        <img src="${career.image}">
        <h3>${career.title}</h3>
        <p>${career.description.substring(0,80)}...</p>

        <button onclick="saveFavorite(${career.id}, this)">
          ❤️ Save
        </button>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error(err);
  }
}

loadRecommendedCareers();