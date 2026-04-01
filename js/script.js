function toggleChat() {
  const chat = document.getElementById("chatWindow");
  chat.style.display = chat.style.display === "block" ? "none" : "block";
}

// Send Message
function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  if (message === "") return;

  addUserMessage(message);
  input.value = "";

  setTimeout(() => {
    botReply(message);
  }, 600);
}

// Add user message
function addUserMessage(text) {
  const chatBody = document.getElementById("chatBody");
  const msg = document.createElement("div");
  msg.className = "user-msg";
  msg.innerText = text;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Add bot message
function addBotMessage(text) {
  const chatBody = document.getElementById("chatBody");
  const msg = document.createElement("div");
  msg.className = "bot-msg";
  msg.innerText = text;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Bot logic
async function botReply(userText) {
  addBotMessage("Typing...");

  const response = await fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userText })
  });

  const data = await response.json();

  // Remove "Typing..."
  const chatBody = document.getElementById("chatBody");
  chatBody.lastChild.remove();

  addBotMessage(data.reply);
}



  function startVoice() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Voice recognition not supported in this browser");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-IN";
  recognition.start();

  recognition.onresult = function(event) {
    const voiceText = event.results[0][0].transcript;
    document.getElementById("userInput").value = voiceText;
    sendMessage();
  };
}


