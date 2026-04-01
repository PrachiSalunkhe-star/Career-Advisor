const API = "http://localhost:3000";

/* ==========================
   CHECK LOGIN
========================== */
const userId = localStorage.getItem("user_id");

if (!userId) {
  alert("Please login first");
  window.location.href = "login.html";
}


/* ==========================
   LOAD RESULT DATA
========================== */
async function loadResults() {

  try {

    const response = await fetch(
      `${API}/assessment-result/${userId}`
    );

    const data = await response.json();

    console.log("Result:", data);

    if (!data.stream) {
      document.getElementById("streamName").textContent =
        "No Stream Found";
      return;
    }

    // ✅ SHOW STREAM
    document.getElementById("streamName").textContent =
      data.stream + " Stream";

    // ✅ SHOW COURSES
    showCourses(data.stream);

    // ✅ SHOW CAREERS (AUTO FROM DB)
    renderCareers(data.careers);

  } catch (err) {
    console.error("Result loading error:", err);
  }
}


/* ==========================
   SHOW OPPORTUNITIES
========================== */
function showOpportunities(opportunities) {

  const container =
    document.getElementById("opportunitiesContainer");

  if (!container) {
    console.error("❌ opportunitiesContainer NOT FOUND");
    return;
  }

  container.innerHTML = "";

  if (!opportunities.length) {
    container.innerHTML = "<p>No opportunities found.</p>";
    return;
  }

  opportunities.forEach(op => {
    container.innerHTML += `
      <div class="career-card">
        ${op}
      </div>
    `;
  });
}


/* ==========================
   SHOW COURSES
========================== */
function showCourses(category) {

  const courseMap = {
    Science: ["B.Tech", "MBBS", "B.Sc", "B.Pharmacy"],
    Commerce: ["B.Com", "BBA", "CA", "Finance"],
    Arts: ["BA", "Journalism", "Psychology"],
    Engineering: ["B.Tech", "Diploma Engineering"],
    Management: ["BBA", "MBA", "Business Studies"],
    Technical: ["Polytechnic", "ITI Courses"],
    Design: ["B.Des", "UI/UX", "Animation"]
  };

  const list = document.getElementById("courseList");
  list.innerHTML = "";

  (courseMap[category] || []).forEach(course => {
    list.innerHTML += `<li>${course}</li>`;
  });
}


/* ==========================
   RENDER CAREERS
========================== */
function renderCareers(careers) {

  const container = document.getElementById("careerContainer");
  container.innerHTML = "";

  if (!careers || careers.length === 0) {
    container.innerHTML =
      "<p>No career recommendations.</p>";
    return;
  }

  careers.forEach(career => {

    container.innerHTML += `
      <div class="career-card">
        <h4>${career.title}</h4>
        <p>${career.description || ""}</p>
        <small>Salary: ${career.salary || "N/A"}</small>
      </div>
    `;
  });
}


/* ==========================
   BUTTON ACTIONS
========================== */
document
  .getElementById("findCollegeBtn")
  .addEventListener("click", () => {

    const stream =
      document.getElementById("streamName").textContent;

    localStorage.setItem("selected_category", stream);

    window.location.href = "colleges.html";
  });


function goExplore() {
  window.location.href = "explore.html";
}


/* ==========================
   INIT
========================== */
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM Loaded");

  console.log(
    "opportunitiesContainer =",
    document.getElementById("opportunitiesContainer")
  );

  loadResults();
});