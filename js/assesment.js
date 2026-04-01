let questions = [];
let currentIndex = 0;
let selectedLevel = "";
let selectedAnswers = [];   // ✅ this is the correct array


// ===============================
// 🔐 CHECK LOGIN (NO REDIRECT)
// ===============================

const userLoggedIn = localStorage.getItem("userLoggedIn");

if (userLoggedIn !== "true") {

  alert("⚠️ Please login first to access assessment.");

  // stop all assessment code
  throw new Error("User not logged in");
}
/* ============================
   START ASSESSMENT
============================ */
window.startAssessment = async (level) => {

  selectedLevel = level;
  localStorage.setItem("education_level", level);  // ✅ ADD THIS
  // ✅ Store level for submission
  localStorage.setItem("education_level", level);

  document.getElementById("levelSelection").style.display = "none";

  try {
    const response = await fetch(
      `http://localhost:3000/assessment/${level}`
    );

    if (!response.ok) {
      throw new Error("Failed to load questions");
    }

    questions = await response.json();

    if (!questions || questions.length === 0) {
      alert("No questions available for this level.");
      return;
    }

    currentIndex = 0;
    selectedAnswers = [];   // reset answers

    showQuestion();

  } catch (error) {
    console.error("Error loading questions:", error);
    alert("Unable to load questions.");
  }
};


/* ============================
   SHOW QUESTION
============================ */
function showQuestion() {

  if (currentIndex >= questions.length) {
    finishAssessment();
    return;
  }

  const q = questions[currentIndex];
  const box = document.getElementById("questionBox");

  box.classList.remove("hidden");

  const encouragingTips = [
    "Great skills are built one decision at a time—choose what feels true.",
    "Your next career move is aligned with the values you pick here.",
    "Quick update: 70% of users find a stronger career direction after this test.",
    "Keep going! Every answer brings you closer to the best-fit stream.",
    "Remember: there are no wrong answers, only insights about you."
  ];

  const tip = encouragingTips[currentIndex % encouragingTips.length];

  box.innerHTML = `
    <h3>${q.question}</h3>
    <div class="options">
      <button onclick="answer('${q.category_a}')">${q.option_a}</button>
      <button onclick="answer('${q.category_b}')">${q.option_b}</button>
      <button onclick="answer('${q.category_c}')">${q.option_c}</button>
      <button onclick="answer('${q.category_d}')">${q.option_d}</button>
    </div>

    <div class="question-extra">
      <h4>✨ Pro Tip</h4>
      <p>${tip}</p>
      <p class="small">Answer honestly and you will discover your ideal stream faster.</p>
    </div>
  `;
}


/* ============================
   SAVE ANSWER
============================ */
window.answer = (category) => {

  if (!category) {
    alert("Invalid option selected.");
    return;
  }

  // ✅ Use selectedAnswers (NOT answers)
 selectedAnswers.push(category); // ✅ Store category directly

  currentIndex++;
  showQuestion();
};


/* ============================
   FINISH ASSESSMENT
============================ */
/* ============================
   FINISH ASSESSMENT
============================ */
async function finishAssessment() {

  const user_id = localStorage.getItem("user_id");
  const education_level = localStorage.getItem("education_level");

  if (!user_id) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  if (selectedAnswers.length === 0) {
    alert("Please answer all questions.");
    return;
  }

  console.log("Sending Data:", {
    user_id,
    education_level,
    answers: selectedAnswers
  });

  try {

    const response = await fetch(
      "http://localhost:3000/submit-assessment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id,
          education_level,
          answers: selectedAnswers
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Submission failed");
      return;
    }

    // ✅ SAVE RESULT FOR RESULT PAGE
    localStorage.setItem(
      "assessmentResult",
      JSON.stringify(data)
    );

    alert("✅ Assessment Completed!");

    // ✅ AUTO REDIRECT TO RESULT PAGE
    window.location.href = "assessment-result.html";

  } catch (error) {
    console.error("Error:", error);
    alert("Server error occurred.");
  }
}