document.addEventListener("DOMContentLoaded", function () {
  const chatWindow = document.getElementById("chatWindow");
  const chatToggleBtn = document.getElementById("chatToggleBtn");
  const closeChat = document.getElementById("closeChat");
  const sendBtn = document.getElementById("sendBtn");
  const voiceBtn = document.getElementById("voiceBtn");
  const userInput = document.getElementById("userInput");
  const chatBody = document.getElementById("chatBody");

  // Toggle chat
  chatToggleBtn.addEventListener("click", () => {
    chatWindow.style.display = "flex";
  });

  closeChat.addEventListener("click", () => {
    chatWindow.style.display = "none";
  });

  // Send message
  sendBtn.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendMessage();
  });

  function sendMessage() {
    const message = userInput.value.trim();
    if (message === "") return;

    addMessage(message, "user-msg");
    userInput.value = "";

    setTimeout(() => {
      const reply = getBotResponse(message);
      addMessage(reply, "bot-msg");
    }, 500);
  }

  function addMessage(text, className) {
    const messageDiv = document.createElement("div");
    messageDiv.className = className;
    messageDiv.innerText = text;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function getBotResponse(input) {
    input = input.toLowerCase();

    if (input.includes("engineering")) {
      return "Engineering includes Computer Science, Mechanical, Civil, Electrical and more.";
    }

    if (input.includes("medical")) {
      return "Medical field includes MBBS, BDS, Nursing, Pharmacy and Allied Health Sciences.";
    }

    if (input.includes("commerce")) {
      return "Commerce careers include CA, Business Management, Banking, Finance and Marketing.";
    }

    if (input.includes("arts")) {
      return "Arts stream offers Psychology, Literature, Design, Social Work and many more.";
    }

    if (input.includes("college")) {
      return "You can explore the Colleges section from the navigation menu.";
    }

    if (input.includes("assessment")) {
      return "Click on Assessment to take our AI-powered career test.";
    }

    return "That’s interesting! Tell me more about your interests so I can guide you better.";
  }

  // Voice Recognition
  voiceBtn.addEventListener("click", () => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();

    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = function (event) {
      userInput.value = event.results[0][0].transcript;
    };
  });
});
