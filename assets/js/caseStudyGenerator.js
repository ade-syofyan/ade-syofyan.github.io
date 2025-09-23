function initializeCaseStudyGenerator() {
  const modal = document.getElementById("caseStudyModal");
  if (!modal) return;

  window.closeCaseStudyModal = function () {
    modal.classList.remove("open");
    document.body.classList.remove("modal-open");
  };

  modal.addEventListener("click", (e) => {
    if (e.target === modal) window.closeCaseStudyModal();
  });
}

function extractRelevantSentences(text, keywords) {
  if (!text) return [];

  const sentences = text.split(/(?<=[.?!])\s+/);
  const relevantSentences = new Set(); 

  keywords.forEach((keyword) => {
    sentences.forEach((sentence) => {
      if (sentence.toLowerCase().includes(keyword.toLowerCase())) {
        const cleanedSentence = sentence.replace(/\*\*(.*?)\*\*/g, "$1");
        relevantSentences.add(cleanedSentence.trim());
      }
    });
  });

  return Array.from(relevantSentences);
}

function renderCaseStudy(title, content, textContentForPdf) {
  const modal = document.getElementById("caseStudyModal");
  const titleEl = document.getElementById("caseStudyTitle");
  const bodyEl = document.getElementById("caseStudyBody");
  const downloadBtn = document.getElementById("downloadCaseStudyPdfBtn");

  if (!modal || !titleEl || !bodyEl || !downloadBtn) return;

  titleEl.textContent = title;
  bodyEl.innerHTML = content;

  const newDownloadBtn = downloadBtn.cloneNode(true);
  downloadBtn.parentNode.replaceChild(newDownloadBtn, downloadBtn);
  newDownloadBtn.addEventListener("click", () =>
    generatePdf(title, textContentForPdf)
  );

  lucide.createIcons();
  modal.classList.add("open");
  document.body.classList.add("modal-open");
}

function generatePdf(title, textContent) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const lines = doc.splitTextToSize(textContent, 180);
  doc.text(lines, 14, 35);

  doc.save(`Studi_Kasus_Virtual_-_Ade_Syofyan.pdf`);
}

window.generateCaseStudy = function (topic) {
  const topicTitle = topic.charAt(0).toUpperCase() + topic.slice(1);
  const title = `Solusi Virtual untuk Kebutuhan ${topicTitle}`;

  const keywordMap = {
    logistik: ["logistik", "pelacakan", "migrasi sistem", "skalabilitas"],
    otomotif: ["otomotif", "booking service", "test drive", "dealer"],
    pendidikan: ["ppdb", "pendaftaran", "sekolah", "siswa"],
    properti: ["properti", "jual beli", "listing"],
  };

  const relevantKeywords = keywordMap[topic.toLowerCase()];
  if (!relevantKeywords) return;

  let relevantFeatures = new Set();
  let relevantImpacts = new Set();
  let relevantTech = new Set();

  projectsData.forEach((project) => {
    const features = extractRelevantSentences(
      project.process,
      relevantKeywords
    );
    const impacts = extractRelevantSentences(project.impact, relevantKeywords);

    if (features.length > 0 || impacts.length > 0) {
      features.forEach((f) => relevantFeatures.add(f));
      impacts.forEach((i) => relevantImpacts.add(i));
      if (project.tag.includes("Mobile")) relevantTech.add("Flutter");
      if (project.tag.includes("Stack") || project.tag.includes("Backend"))
        relevantTech.add("Laravel");
    }
  });

  let htmlContent = `<p class="mb-6 text-lg" style="color: var(--text-secondary);">Berikut adalah rangkuman solusi yang dapat saya tawarkan berdasarkan pengalaman dari berbagai proyek yang pernah saya kerjakan:</p>`;
  let textContent = `Berikut adalah rangkuman solusi yang dapat saya tawarkan berdasarkan pengalaman dari berbagai proyek yang pernah saya kerjakan:\n\n`;

  if (relevantFeatures.size > 0) {
    htmlContent += `<h4 class="text-xl font-semibold mb-3 text-accent">Fitur Relevan yang Pernah Dibangun:</h4><ul class="list-disc list-inside mb-6 space-y-2" style="color: var(--text-secondary);">`;
    textContent += "Fitur Relevan yang Pernah Dibangun:\n";
    relevantFeatures.forEach((item) => {
      htmlContent += `<li>${item}</li>`;
      textContent += `- ${item}\n`;
    });
    htmlContent += `</ul>`;
    textContent += "\n";
  }

  if (relevantImpacts.size > 0) {
    htmlContent += `<h4 class="text-xl font-semibold mb-3 text-accent">Potensi Dampak untuk Bisnis Anda:</h4><ul class="list-disc list-inside mb-6 space-y-2" style="color: var(--text-secondary);">`;
    textContent += "Potensi Dampak untuk Bisnis Anda:\n";
    relevantImpacts.forEach((item) => {
      htmlContent += `<li>${item}</li>`;
      textContent += `- ${item}\n`;
    });
    htmlContent += `</ul>`;
    textContent += "\n";
  }

  if (relevantTech.size > 0) {
    htmlContent += `<h4 class="text-xl font-semibold mb-3 text-accent">Teknologi yang Direkomendasikan:</h4><p style="color: var(--text-secondary);">${Array.from(
      relevantTech
    ).join(", ")}</p>`;
    textContent += `Teknologi yang Direkomendasikan:\n${Array.from(
      relevantTech
    ).join(", ")}\n`;
  }

  renderCaseStudy(title, htmlContent, textContent);
};
