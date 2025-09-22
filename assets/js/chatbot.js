// js/chatbot.js

let conversationHistory = [];

function initializeChatbot() {
  const chatbotModal = document.getElementById("chatbotModal");
  if (!chatbotModal) return;

  const chatDisplay = document.getElementById("chatDisplay");
  const chatInput = document.getElementById("chatInput");

  window.openChatbotModal = function () {
    chatbotModal.classList.add("open");
    chatInput.focus();
    loadChatHistory();
    if (chatDisplay.children.length <= 1) {
      addQuickOptions();
    }
  };

  function actuallyCloseChatbot() {
    chatbotModal.classList.remove("open");
    document.body.style.overflow = "";
  }

  window.closeChatbotModal = function () {
    const hasUserInteracted = chatDisplay.querySelector(".flex.justify-end");
    if (!hasUserInteracted) {
      actuallyCloseChatbot();
    } else {
      showCustomConfirm(
        "Simpan sesi chat ini?",
        () => {
          saveChatHistory();
          actuallyCloseChatbot();
        },
        () => {
          deleteChatHistory();
          actuallyCloseChatbot();
        },
        "Simpan",
        "Jangan Simpan"
      );
    }
  };

  chatbotModal.addEventListener("click", (e) => {
    if (e.target === chatbotModal) closeChatbotModal();
  });

  chatInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendChatMessage();
    }
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function addQuickOptions() {
  const chatDisplay = document.getElementById("chatDisplay");
  const selectedOptions = shuffleArray([...allQuickChatOptions]).slice(0, 3);

  const quickOptionsDiv = document.createElement("div");
  quickOptionsDiv.className = "flex flex-wrap gap-2 mt-2 mb-2 justify-start";
  selectedOptions.forEach((optionText) => {
    const button = document.createElement("button");
    button.className = "text-sm py-1 px-3 rounded-full transition-colors";
    button.style =
      "background-color: var(--bg-card-secondary); color: var(--text-secondary);";
    button.textContent = optionText;
    button.onclick = () => {
      document.getElementById("chatInput").value = optionText;
      sendChatMessage();
      if (quickOptionsDiv.parentNode) {
        quickOptionsDiv.parentNode.removeChild(quickOptionsDiv);
      }
    };
    quickOptionsDiv.appendChild(button);
  });
  chatDisplay.appendChild(quickOptionsDiv);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

function analyzeAndHighlight(text) {
  const lowerText = text.toLowerCase();
  document
    .querySelectorAll(".highlight-feature")
    .forEach((el) => el.classList.remove("highlight-feature"));

  const keywordMap = {
    flutter: '[data-skill="mobile"]',
    kotlin: '[data-skill="mobile"]',
    mobile: '[data-skill="mobile"]',
    laravel: '[data-skill="web"]',
    php: '[data-skill="web"]',
    web: '[data-skill="web"]',
    ai: '[data-skill="ai"]',
    chatbot: '[data-skill="ai"]',
    erp: '[data-skill="erp"]',
    firebase: '[data-skill="firebase"]',
  };

  for (const keyword in keywordMap) {
    if (lowerText.includes(keyword)) {
      const elementToHighlight = document.querySelector(keywordMap[keyword]);
      if (elementToHighlight) {
        elementToHighlight.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setTimeout(
          () => elementToHighlight.classList.add("highlight-feature"),
          500
        );
        setTimeout(
          () => elementToHighlight.classList.remove("highlight-feature"),
          2500
        );
        break;
      }
    }
  }
}

function typeMessage(element, text, delay = 20) {
  let i = 0;
  element.innerHTML = "";
  function typing() {
    if (i < text.length) {
      if (text.charAt(i) === "<") {
        const tagEndIndex = text.indexOf(">", i);
        if (tagEndIndex !== -1) {
          element.innerHTML += text.substring(i, tagEndIndex + 1);
          i = tagEndIndex + 1;
          typing();
          return;
        }
      }
      element.innerHTML += text.charAt(i);
      i++;
      document.getElementById("chatDisplay").scrollTop =
        document.getElementById("chatDisplay").scrollHeight;
      setTimeout(typing, delay);
    }
  }
  typing();
}

async function sendChatMessage() {
  const chatInput = document.getElementById("chatInput");
  const chatDisplay = document.getElementById("chatDisplay");
  const message = chatInput.value.trim();
  if (!message) return;

  unlockAchievement("ai_challenger");
  const userMessageDiv = document.createElement("div");
  userMessageDiv.className = "flex justify-end mb-2 ";
  userMessageDiv.innerHTML = `<div class="bg-blue-600 text-white p-3 rounded-lg max-w-[80%] chat-message">${message}</div>`;
  chatDisplay.appendChild(userMessageDiv);

  conversationHistory.push({ role: "user", parts: [{ text: message }] });
  analyzeAndHighlight(message);
  chatInput.value = "";

  const loadingDiv = document.createElement("div");
  loadingDiv.className = "flex justify-start mb-2";
  loadingDiv.innerHTML = `<div class="p-3 rounded-lg max-w-[80%] animate-pulse chat-message" style="background-color: var(--bg-card-secondary); color: var(--text-secondary);">Mengetik...</div>`;
  chatDisplay.appendChild(loadingDiv);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;

  try {
    const payload = {
      contents: conversationHistory,
      systemInstruction: { parts: [{ text: systemInstructionText }] },
    };
    const apiKey = "AIzaSyAYoqmGxZT9FwG2obC3-xpxSN6orVxi0Wk"; // Sebaiknya dipindahkan ke environment variable di sisi server
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    chatDisplay.removeChild(loadingDiv);

    if (result.candidates && result.candidates[0].content) {
      const modelResponse = result.candidates[0].content;
      let text = modelResponse.parts[0].text;

      // --- IDE BRILIAN: Analisis respons AI dan sorot keahlian yang relevan ---
      analyzeAndHighlight(text);

      const whatsappRegex = new RegExp(`\\[(.*?)\\]\\((${siteConfig.social.whatsapp.replace('?','\\?')}.*?)\\)`);
      if (whatsappRegex.test(text)) {
        const encodedMessage = encodeURIComponent(
          `Halo Ade, saya tertarik dengan ${message}`
        );
        const waLink = `${siteConfig.social.whatsapp}?text=${encodedMessage}`;
        text = text.replace(whatsappRegex, `<a href="${waLink}" target="_blank" class="text-blue-400 hover:underline">WhatsApp</a>`);
      } else {
         text = text.replace(
          whatsappRegex,
          '<a href="$2" target="_blank" class="text-blue-400 hover:underline">$1</a>'
        );
      }

      const aiMessageDiv = document.createElement("div");
      aiMessageDiv.className = "flex justify-start mb-2";
      chatDisplay.appendChild(aiMessageDiv);
      conversationHistory.push({ role: "model", parts: [{ text: text }] });
      typeMessage(
        aiMessageDiv,
        `<div class="p-3 rounded-lg max-w-[80%] chat-message" style="background-color: var(--bg-card-secondary);">${text}</div>`
      );
    } else {
      throw new Error("Invalid response from API");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (chatDisplay.contains(loadingDiv)) chatDisplay.removeChild(loadingDiv);
    const errorMessageDiv = document.createElement("div");
    errorMessageDiv.className = "flex justify-start mb-2";
    errorMessageDiv.innerHTML = `<div class="bg-red-500 text-white p-3 rounded-lg max-w-[80%] chat-message">Terjadi kesalahan. Coba lagi nanti.</div>`;
    chatDisplay.appendChild(errorMessageDiv);
  } finally {
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
  }
}

function saveChatHistory() {
  localStorage.setItem("chatbotHistory", JSON.stringify(conversationHistory));
}

function deleteChatHistory() {
  localStorage.removeItem("chatbotHistory");
  conversationHistory = [];
  document.getElementById(
    "chatDisplay"
  ).innerHTML = `<div class="flex justify-start mb-2"><div class="p-3 rounded-lg max-w-[80%] chat-message" style="background-color: var(--bg-card-secondary);">Halo! Ada yang bisa saya bantu?</div></div>`;
}

function loadChatHistory() {
  const chatDisplay = document.getElementById("chatDisplay");
  const savedHistory = localStorage.getItem("chatbotHistory");
  chatDisplay.innerHTML = "";
  conversationHistory = [];
  if (savedHistory) {
    conversationHistory = JSON.parse(savedHistory);
    conversationHistory.forEach((msg) => {
      const isUser = msg.role === "user";
      const messageDiv = document.createElement("div");
      messageDiv.className = `flex ${
        isUser ? "justify-end" : "justify-start"
      } mb-2`;
      messageDiv.innerHTML = `<div class="${
        isUser ? "bg-blue-600 text-white" : ""
      } p-3 rounded-lg max-w-[80%] chat-message" style="${
        !isUser ? "background-color: var(--bg-card-secondary);" : ""
      }">${msg.parts[0].text}</div>`;
      chatDisplay.appendChild(messageDiv);
    });
  } else {
    chatDisplay.innerHTML = `<div class="flex justify-start mb-2"><div class="p-3 rounded-lg max-w-[80%] chat-message" style="background-color: var(--bg-card-secondary);">Halo! Ada yang bisa saya bantu?</div></div>`;
  }
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}
