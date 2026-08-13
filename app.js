/**
 * CT Survey Kids - Application Logic
 * Computational Thinking Survey for Elementary Students (Grades 5-6)
 * 
 * --------------------------------------------------------------------------
 * 📌 สำหรับผู้วิจัย: นำ Web App URL จาก Google Apps Script มาวางในอัญประกาศ ("...")
 * ด้านล่างนี้เพียงครั้งเดียว เมื่ออัปโหลดขึ้นเว็บแล้ว ทุกคนที่ตอบแบบสำรวจจากทุกเครื่อง
 * ข้อมูลจะเด้งเข้า Google Sheets ของคุณทันทีโดยไม่ต้องตั้งค่าใหม่ในทุกๆ เครื่อง!
 * --------------------------------------------------------------------------
 */
const DEFAULT_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbynRIu1csqF4HK1-8nSQ3l01UcL4Ue5yfFAm1m455a8qyuwH8uAciQ_Oq7PVI4GGDBTMQ/exec"; // <-- วาง URL จาก Google Apps Script ตรงนี้ เช่น "https://script.google.com/macros/s/AKfy.../exec"
// --- App State ---
let currentStep = 0;
let surveyAnswers = {};
let webhookUrl = localStorage.getItem("ct_webhook_url") || DEFAULT_WEBHOOK_URL;
const SURVEY_DOMAINS = [
  {
    id: 1,
    title: "ด้านที่ 1 การแยกย่อยปัญหา (Decomposition)",
    containerId: "container-domain-1",
    questions: [
      { id: "q1", num: 1, text: "เมื่อพบปัญหาที่ยาก ฉันสามารถแบ่งปัญหาออกเป็นส่วนย่อย ๆ ได้" },
      { id: "q2", num: 2, text: "ฉันสามารถแยกงานใหญ่ออกเป็นงานเล็ก ๆ ก่อนลงมือทำ" },
      { id: "q3", num: 3, text: "ฉันสามารถบอกได้ว่าปัญหาที่ยากประกอบด้วยส่วนย่อยอะไรบ้าง" },
      { id: "q4", num: 4, text: "ฉันสามารถอธิบายขั้นตอนย่อยของการแก้ปัญหาให้เพื่อนฟังได้" },
      { id: "q5", num: 5, text: "ฉันสามารถแบ่งข้อมูลออกเป็นหมวดหมู่ย่อย ๆ เพื่อให้จัดการได้ง่ายขึ้น" }
    ]
  },
  {
    id: 2,
    title: "ด้านที่ 2 การมองหาและรู้จำรูปแบบ (Pattern Recognition)",
    containerId: "container-domain-2",
    questions: [
      { id: "q6", num: 6, text: "ฉันสามารถสังเกตเห็นความเหมือนของปัญหาที่เคยพบมาก่อน" },
      { id: "q7", num: 7, text: "ฉันสามารถนำวิธีแก้ปัญหาเดิมมาใช้กับปัญหาใหม่ได้" },
      { id: "q8", num: 8, text: "ฉันสามารถสังเกตเห็นสิ่งที่คล้ายกันหรือเกี่ยวข้องกันในข้อมูลได้" },
      { id: "q9", num: 9, text: "ฉันสามารถคาดเดาสิ่งที่จะเกิดขึ้นจากรูปแบบที่พบ" },
      { id: "q10", num: 10, text: "ฉันสามารถเปรียบเทียบความเหมือนและความแตกต่างของปัญหาได้" }
    ]
  },
  {
    id: 3,
    title: "ด้านที่ 3 การคิดเชิงนามธรรม (Abstraction)",
    containerId: "container-domain-3",
    questions: [
      { id: "q11", num: 11, text: "ฉันสามารถเลือกเฉพาะข้อมูลสำคัญในการแก้ปัญหาได้" },
      { id: "q12", num: 12, text: "ฉันสามารถตัดรายละเอียดที่ไม่จำเป็นออกได้" },
      { id: "q13", num: 13, text: "ฉันสามารถสรุปใจความสำคัญของปัญหาได้" },
      { id: "q14", num: 14, text: "ฉันสามารถใช้สัญลักษณ์หรือรูปภาพ (เช่น ลูกศร ตัวเลข เครื่องหมาย) แทนข้อมูลหรือขั้นตอนการทำงานได้" },
      { id: "q15", num: 15, text: "ฉันสามารถอธิบายเรื่องที่เข้าใจยากให้เพื่อนเข้าใจง่ายขึ้นได้" }
    ]
  },
  {
    id: 4,
    title: "ด้านที่ 4 การออกแบบขั้นตอนวิธี (Algorithms)",
    containerId: "container-domain-4",
    questions: [
      { id: "q16", num: 16, text: "ฉันสามารถเรียงลำดับขั้นตอนการทำงานได้อย่างถูกต้อง" },
      { id: "q17", num: 17, text: "ฉันสามารถวางแผนการแก้ปัญหาเป็นขั้นตอนก่อนลงมือทำ" },
      { id: "q18", num: 18, text: "ฉันสามารถเขียนหรือบอกขั้นตอนการทำงานให้ผู้อื่นทำตามได้" },
      { id: "q19", num: 19, text: "ฉันสามารถคิดวิธีการแก้ปัญหาได้หลายวิธี" },
      { id: "q20", num: 20, text: "ฉันสามารถเลือกวิธีการแก้ปัญหาที่เหมาะสมที่สุดได้" }
    ]
  },
  {
    id: 5,
    title: "ด้านที่ 5 การประเมินและแก้ไขข้อผิดพลาด (Evaluation)",
    containerId: "container-domain-5",
    questions: [
      { id: "q21", num: 21, text: "เมื่อทำงานผิดพลาด ฉันสามารถค้นหาสาเหตุของปัญหาได้" },
      { id: "q22", num: 22, text: "ฉันสามารถแก้ไขข้อผิดพลาดของตนเองได้" },
      { id: "q23", num: 23, text: "ฉันสามารถตรวจสอบว่าคำตอบของตนเองถูกต้องหรือไม่" },
      { id: "q24", num: 24, text: "ฉันสามารถปรับปรุงวิธีการทำงานให้ดีขึ้นได้" },
      { id: "q25", num: 25, text: "ฉันสามารถลองวิธีใหม่เมื่อวิธีเดิมไม่สำเร็จ" }
    ]
  }
];
const LIKERT_OPTIONS = [
  { value: 5, emoji: "🤩", text: "เป็นจริงมากที่สุด", scoreText: "5 คะแนน" },
  { value: 4, emoji: "😀", text: "เป็นจริงมาก", scoreText: "4 คะแนน" },
  { value: 3, emoji: "🙂", text: "เป็นจริงปานกลาง", scoreText: "3 คะแนน" },
  { value: 2, emoji: "🙁", text: "เป็นจริงน้อย", scoreText: "2 คะแนน" },
  { value: 1, emoji: "😅", text: "เป็นจริงน้อยที่สุด", scoreText: "1 คะแนน" }
];
const MASCOT_MESSAGES = [
  "สวัสดีครับเพื่อนๆ! มาเริ่มทำแบบสำรวจสนุกๆ กันเลย!",
  "กรอกข้อมูลส่วนตัวของน้องๆ ให้ครบถ้วนนะ!",
  "ด้านที่ 1: การแบ่งงานใหญ่เป็นงานเล็กๆ ลองคิดตามดูนะ!",
  "ด้านที่ 2: มองหาแบบแผนที่คุ้นเคย ทำได้ดีมากครับ!",
  "ด้านที่ 3: ดึงเอาแค่ใจความสำคัญออกมา น้องๆ เก่งมาก!",
  "ด้านที่ 4: วางแผนการทำงานเป็นขั้นเป็นตอน สู้ๆ อีกนิดเดียว!",
  "ด้านที่ 5: ตรวจสอบและแก้ไขข้อผิดพลาด ส่วนสุดท้ายแล้ว!",
  "ยินดีด้วยครับ! น้องๆ ทำแบบสำรวจสำเร็จแล้ว ⭐"
];
// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  renderPart2Questions();
  setupEventListeners();
  loadSavedDraft();
});
// Render Dynamic Part 2 Rating Cards
function renderPart2Questions() {
  SURVEY_DOMAINS.forEach(domain => {
    const container = document.getElementById(domain.containerId);
    if (!container) return;
    let html = "";
    domain.questions.forEach(q => {
      html += `
        <div class="form-group" id="group-${q.id}">
          <label class="question-title">
            <span class="q-num">${q.num}</span> ${q.text} <span class="required">*</span>
          </label>
          <div class="rating-scale-grid">
            ${LIKERT_OPTIONS.map(opt => `
              <label class="rating-option">
                <input type="radio" name="${q.id}" value="${opt.value}" onchange="onRatingSelect('${q.id}', ${opt.value})">
                <div class="rating-btn">
                  <span class="rating-emoji">${opt.emoji}</span>
                  <span class="rating-score">${opt.scoreText}</span>
                  <span class="rating-text">${opt.text}</span>
                </div>
              </label>
            `).join('')}
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  });
}
// Global rating change event
function onRatingSelect(questionId, value) {
  surveyAnswers[questionId] = value;
  saveDraftToLocalStorage();
}
// Setup App Events
function setupEventListeners() {
  // Start Button
  document.getElementById("btn-start")?.addEventListener("click", () => goToStep(1));
  // Next Buttons
  document.querySelectorAll(".btn-next").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const current = parseInt(e.currentTarget.getAttribute("data-current"));
      if (validateStep(current)) {
        goToStep(current + 1);
      }
    });
  });
  // Prev Buttons
  document.querySelectorAll(".btn-prev").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const target = parseInt(e.currentTarget.getAttribute("data-target"));
      goToStep(target);
    });
  });
  // Submit Button
  document.getElementById("btn-submit")?.addEventListener("click", submitSurvey);
  // Restart Button
  document.getElementById("btn-restart")?.addEventListener("click", () => {
    if (confirm("ต้องการเริ่มทำแบบสำรวจใหม่หรือไม่? (ข้อมูลปัจจุบันจะถูกล้าง)")) {
      localStorage.removeItem("ct_survey_draft");
      surveyAnswers = {};
      document.getElementById("form-part1")?.reset();
      document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
      goToStep(0);
    }
  });
  // Download CSV
  document.getElementById("btn-download-csv")?.addEventListener("click", downloadCSV);
  // "Other App" Checkbox toggle
  const chkOther = document.getElementById("chk-other-app");
  const txtOther = document.getElementById("txt-other-app");
  if (chkOther && txtOther) {
    chkOther.addEventListener("change", () => {
      txtOther.disabled = !chkOther.checked;
      if (chkOther.checked) txtOther.focus();
    });
  }
  // Modal Settings Toggle
  const btnConfig = document.getElementById("btn-config");
  const modalConfig = document.getElementById("modal-config");
  const btnCloseModal = document.getElementById("btn-close-modal");
  const btnSaveConfig = document.getElementById("btn-save-config");
  const inputWebhookUrl = document.getElementById("input-webhook-url");
  if (btnConfig && modalConfig) {
    btnConfig.addEventListener("click", () => {
      inputWebhookUrl.value = webhookUrl;
      modalConfig.classList.remove("hidden");
    });
    btnCloseModal.addEventListener("click", () => modalConfig.classList.add("hidden"));
    btnSaveConfig.addEventListener("click", () => {
      webhookUrl = inputWebhookUrl.value.trim();
      localStorage.setItem("ct_webhook_url", webhookUrl);
      showToast("บันทึกการตั้งค่าเรียบร้อยแล้ว", "success");
      modalConfig.classList.add("hidden");
    });
  }
}
// Step Navigation
function goToStep(stepIndex) {
  currentStep = stepIndex;
  // Toggle Visibility
  document.querySelectorAll(".survey-step").forEach((step, idx) => {
    if (idx === stepIndex) {
      step.classList.remove("hidden");
    } else {
      step.classList.add("hidden");
    }
  });
  // Progress Bar Visibility
  const progressWrapper = document.getElementById("progress-wrapper");
  if (stepIndex >= 1 && stepIndex <= 6) {
    progressWrapper.classList.remove("hidden");
    updateProgressBar(stepIndex);
  } else {
    progressWrapper.classList.add("hidden");
  }
  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}
// Update Progress Bar & Mascot Text
function updateProgressBar(step) {
  const percent = Math.round((step / 6) * 100);
  document.getElementById("step-label").innerText = `ขั้นตอนที่ ${step} จาก 6`;
  document.getElementById("progress-percent").innerText = `${percent}%`;
  document.getElementById("progress-bar-fill").style.width = `${percent}%`;
  // Mascot Tip
  const mascotText = document.getElementById("mascot-text");
  if (mascotText && MASCOT_MESSAGES[step]) {
    mascotText.innerText = MASCOT_MESSAGES[step];
  }
}
// Validation Step by Step
function validateStep(step) {
  if (step === 1) {
    const gender = document.querySelector('input[name="gender"]:checked');
    const grade = document.querySelector('input[name="grade"]:checked');
    const experience = document.querySelector('input[name="experience"]:checked');
    if (!gender) {
      showToast("กรุณาเลือกเพศของนักเรียนก่อนครับ", "error");
      return false;
    }
    if (!grade) {
      showToast("กรุณาเลือกระดับชั้นของนักเรียนก่อนครับ", "error");
      return false;
    }
    if (!experience) {
      showToast("กรุณาตอบข้อ 3 เคยเรียนโปรแกรมหรือไม่ก่อนครับ", "error");
      return false;
    }
    return true;
  }
  if (step >= 2 && step <= 6) {
    const domain = SURVEY_DOMAINS[step - 2];
    let missingQuestion = null;
    for (let q of domain.questions) {
      const selected = document.querySelector(`input[name="${q.id}"]:checked`);
      if (!selected) {
        missingQuestion = q;
        break;
      }
    }
    if (missingQuestion) {
      showToast(`กรุณาตอบข้อ ${missingQuestion.num} ก่อนไปขั้นตอนต่อไปครับ`, "error");
      const groupEl = document.getElementById(`group-${missingQuestion.id}`);
      if (groupEl) {
        groupEl.scrollIntoView({ behavior: "smooth", block: "center" });
        groupEl.style.animation = "pulseGlow 1s";
      }
      return false;
    }
  }
  return true;
}
// Submit Full Survey
async function submitSurvey() {
  if (!validateStep(6)) return;
  // Gather Part 1
  const gender = document.querySelector('input[name="gender"]:checked')?.value || "";
  const grade = document.querySelector('input[name="grade"]:checked')?.value || "";
  const experience = document.querySelector('input[name="experience"]:checked')?.value || "";
  
  const appElements = document.querySelectorAll('input[name="apps"]:checked');
  let selectedApps = Array.from(appElements).map(el => el.value);
  
  const chkOther = document.getElementById("chk-other-app");
  const txtOther = document.getElementById("txt-other-app");
  if (chkOther?.checked && txtOther?.value.trim()) {
    selectedApps = selectedApps.filter(a => a !== "อื่น ๆ");
    selectedApps.push(`อื่น ๆ (${txtOther.value.trim()})`);
  }
  const payload = {
    timestamp: new Date().toISOString(),
    formattedDate: new Date().toLocaleString("th-TH"),
    gender,
    grade,
    experience,
    apps: selectedApps.join(", "),
    answers: { ...surveyAnswers }
  };
  // Save Complete Payload
  localStorage.setItem("ct_survey_completed_payload", JSON.stringify(payload));
  // Go to completion step
  goToStep(7);
  // Confetti Animation
  if (typeof confetti === "function") {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
  // Post to Google Sheets Webhook if configured
  const sheetsStatus = document.getElementById("sheets-status");
  if (webhookUrl) {
    sheetsStatus.innerHTML = "⏳ กำลังส่งข้อมูลไปยัง Google Sheets...";
    try {
      await fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      sheetsStatus.className = "sheets-status-indicator text-success";
      sheetsStatus.innerHTML = "✅ บันทึกข้อมูลลง Google Sheets เรียบร้อยแล้ว!";
    } catch (err) {
      console.error(err);
      sheetsStatus.className = "sheets-status-indicator text-error";
      sheetsStatus.innerHTML = "⚠️ ไม่สามารถส่งลง Google Sheets ได้ (สามารถดาวน์โหลดไฟล์ CSV แทนได้)";
    }
  } else {
    sheetsStatus.innerHTML = "💡 บันทึกในเครื่องเรียบร้อย (สามารถตั้งค่า Webhook เพื่อส่งเข้า Google Sheets ได้ในปุ่มตั้งค่า)";
  }
}
// Download CSV Data File
function downloadCSV() {
  const payloadRaw = localStorage.getItem("ct_survey_completed_payload");
  if (!payloadRaw) {
    showToast("ไม่พบข้อมูลแบบสำรวจ", "error");
    return;
  }
  const payload = JSON.parse(payloadRaw);
  // Headers
  let headers = ["Timestamp", "เวลาตอบ", "เพศ", "ระดับชั้น", "เคยเรียนโปรแกรม", "แอปพลิเคชันที่เคยใช้"];
  for (let i = 1; i <= 25; i++) {
    headers.push(`ข้อ_${i}`);
  }
  // Row Data
  let row = [
    `"${payload.timestamp}"`,
    `"${payload.formattedDate}"`,
    `"${payload.gender}"`,
    `"${payload.grade}"`,
    `"${payload.experience}"`,
    `"${payload.apps.replace(/"/g, '""')}"`
  ];
  for (let i = 1; i <= 25; i++) {
    row.push(payload.answers[`q${i}`] || "");
  }
  const csvContent = "\uFEFF" + headers.join(",") + "\n" + row.join(",");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `CT_Survey_Result_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
// Save LocalStorage Draft
function saveDraftToLocalStorage() {
  localStorage.setItem("ct_survey_draft", JSON.stringify(surveyAnswers));
}
// Load LocalStorage Draft
function loadSavedDraft() {
  const draftRaw = localStorage.getItem("ct_survey_draft");
  if (draftRaw) {
    try {
      surveyAnswers = JSON.parse(draftRaw);
      Object.keys(surveyAnswers).forEach(qId => {
        const val = surveyAnswers[qId];
        const inputEl = document.querySelector(`input[name="${qId}"][value="${val}"]`);
        if (inputEl) inputEl.checked = true;
      });
    } catch (e) {
      console.error(e);
    }
  }
}
// Toast Helper
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}
