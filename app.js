const state = {
  route: "personal",
  service: "explain",
  files: [],
  rating: 0,
  contextText: "",
  profile: {
    firstName: "Alexandre",
    lastName: "Martin",
    phone: "+33 6 12 34 56 78",
    passport: "PA1234567",
    nationality: "French",
    address: "79 Avenue de la Republique, 75011 Paris"
  }
};

const titles = {
  personal: "Let's validate your information",
  context: "Help us understand your situation",
  upload: "Upload your document(s)",
  assistant: "Interactive Document Assistant",
  resources: "Next Steps & Useful Resources",
  help: "Help & Support",
  chat: "Chat with a Consultant",
  review: "Review & Feedback",
  thanks: "Thank you"
};

const progressOrder = ["personal", "context", "upload", "assistant", "resources"];

const app = document.querySelector("#app");
const title = document.querySelector("#screenTitle");

function setRoute(route) {
  state.route = route;
  title.textContent = titles[route] || titles.personal;
  document.querySelectorAll(".nav-item").forEach((item) => {
    const groupRoute = item.dataset.route;
    const active =
      groupRoute === route ||
      (groupRoute === "upload" && route === "assistant") ||
      (groupRoute === "help" && ["chat", "review", "thanks"].includes(route));
    item.classList.toggle("active", active);
  });
  updateProgress(route);
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateProgress(route) {
  const routeIndex = progressOrder.indexOf(route);
  document.querySelectorAll(".progress-step").forEach((step) => {
    const stepIndex = progressOrder.indexOf(step.dataset.step);
    step.classList.toggle("active", step.dataset.step === route);
    step.classList.toggle("complete", routeIndex > stepIndex && stepIndex >= 0);
  });
}

function render() {
  const views = {
    personal: personalView,
    context: contextView,
    upload: uploadView,
    assistant: assistantView,
    resources: resourcesView,
    help: helpView,
    chat: chatView,
    review: reviewView,
    thanks: thanksView
  };
  app.innerHTML = views[state.route]();
  bindViewEvents();
}

function bindViewEvents() {
  app.querySelectorAll("[data-next]").forEach((button) => {
    button.addEventListener("click", () => setRoute(button.dataset.next));
  });
  app.querySelectorAll("[data-back]").forEach((button) => {
    button.addEventListener("click", () => setRoute(button.dataset.back));
  });
  app.querySelectorAll("[data-service]").forEach((button) => {
    button.addEventListener("click", () => {
      state.service = button.dataset.service;
      render();
    });
  });

  const contextArea = app.querySelector("#contextText");
  if (contextArea) {
    contextArea.value = state.contextText;
    updateCounter(contextArea);
    contextArea.addEventListener("input", () => {
      state.contextText = contextArea.value;
      updateCounter(contextArea);
    });
    app.querySelectorAll(".example-pill").forEach((button) => {
      button.addEventListener("click", () => {
        contextArea.value = button.textContent.trim();
        state.contextText = contextArea.value;
        updateCounter(contextArea);
        contextArea.focus();
      });
    });
  }

  const fileInput = app.querySelector("#fileInput");
  const uploadZone = app.querySelector(".upload-zone");
  if (fileInput && uploadZone) {
    fileInput.addEventListener("change", () => addFiles(fileInput.files));
    uploadZone.addEventListener("dragover", (event) => {
      event.preventDefault();
      uploadZone.classList.add("dragover");
    });
    uploadZone.addEventListener("dragleave", () => uploadZone.classList.remove("dragover"));
    uploadZone.addEventListener("drop", (event) => {
      event.preventDefault();
      uploadZone.classList.remove("dragover");
      addFiles(event.dataTransfer.files);
    });
  }

  app.querySelectorAll("[data-remove-file]").forEach((button) => {
    button.addEventListener("click", () => {
      state.files.splice(Number(button.dataset.removeFile), 1);
      render();
    });
  });

  const chatInput = app.querySelector("#chatInput");
  const chatSend = app.querySelector("#chatSend");
  if (chatInput && chatSend) {
    chatSend.addEventListener("click", () => sendMockMessage(chatInput));
    chatInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") sendMockMessage(chatInput);
    });
  }

  app.querySelectorAll("[data-rating]").forEach((button) => {
    button.addEventListener("click", () => {
      state.rating = Number(button.dataset.rating);
      render();
    });
  });

  const feedback = app.querySelector("#feedback");
  if (feedback) {
    updateCounter(feedback);
    feedback.addEventListener("input", () => updateCounter(feedback));
  }
}

function updateCounter(textarea) {
  const counter = textarea.closest(".counter-group")?.querySelector(".counter");
  if (counter) counter.textContent = `${textarea.value.length}/${textarea.maxLength || 600}`;
}

function addFiles(fileList) {
  const accepted = ["application/pdf", "image/png", "image/jpeg"];
  Array.from(fileList)
    .filter((file) => accepted.includes(file.type) || /\.(pdf|png|jpe?g)$/i.test(file.name))
    .forEach((file) => state.files.push({ name: file.name, size: file.size }));
  render();
}

function fileSize(bytes) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB"];
  let size = bytes;
  let unit = 0;
  while (size > 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(unit ? 1 : 0)} ${units[unit]}`;
}

function sendMockMessage(input) {
  const text = input.value.trim();
  if (!text) return;
  const body = app.querySelector(".chat-body");
  body.insertAdjacentHTML("beforeend", `<div class="message user"><p>${escapeHtml(text)}</p><small>Just now</small></div>`);
  input.value = "";
  body.scrollTop = body.scrollHeight;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function personalView() {
  const fields = [
    ["firstName", "First Name", "text"],
    ["lastName", "Last Name", "text"],
    ["phone", "Phone Number", "tel"],
    ["passport", "Passport / ID Number", "text"],
    ["nationality", "Nationality", "text"],
    ["address", "Address", "text", "full"]
  ];
  return `
    <div class="split-layout">
      <aside class="panel illustration-panel">
        ${identitySvg()}
        <span class="school-badge">ESCP Business School</span>
      </aside>
      <section class="panel form-panel">
        <div class="notice">This information has been pre-filled by ESCP Business School. Please review and update any incorrect information.</div>
        <div class="form-grid">
          ${fields
            .map(([key, label, type, size]) => `
              <div class="field ${size || ""}">
                <label for="${key}">${label}</label>
                <div class="input-row">
                  <input id="${key}" type="${type}" value="${state.profile[key]}" aria-describedby="${key}Status" />
                  <button class="edit-icon" type="button" aria-label="Edit ${label}">✎</button>
                </div>
                <span class="field-status" id="${key}Status">Validated format</span>
              </div>
            `)
            .join("")}
        </div>
        <div class="actions">
          <button class="button primary" type="button" data-next="context">Validate and Continue</button>
        </div>
      </section>
    </div>
  `;
}

function contextView() {
  return `
    <section class="context-layout">
      <div class="panel context-visual">
        ${chatSvg()}
        <div>
          <h2>Help us understand your situation</h2>
          <p>Briefly describe your situation so we can provide the most relevant guidance and recommendations.</p>
        </div>
      </div>
      <div class="panel chat-input-panel">
        <div class="example-list">
          <button class="example-pill" type="button">I am applying for my first residence permit.</button>
          <button class="example-pill" type="button">I recently moved and need to update my address.</button>
        </div>
        <div class="counter-group">
          <textarea id="contextText" maxlength="600" placeholder="Type your message here..."></textarea>
          <div class="counter">0/600</div>
        </div>
        <div class="actions">
          <button class="button secondary" type="button" data-back="personal">Back</button>
          <button class="button primary" type="button" data-next="upload">Submit</button>
        </div>
      </div>
    </section>
  `;
}

function uploadView() {
  return `
    <div class="upload-layout">
      <section class="panel form-panel">
        <label class="upload-zone" for="fileInput">
          <input id="fileInput" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" />
          <span>
            <strong>Drag and drop files here</strong><br />
            PDF, PNG, and JPG files are supported. Multiple files can be uploaded.
          </span>
        </label>
        <div class="document-list">
          ${state.files.length ? state.files.map((file, index) => docItem(file, index)).join("") : `<p class="muted">No documents uploaded yet.</p>`}
        </div>
        <div class="actions">
          <button class="button secondary" type="button" data-back="context">Back</button>
          <button class="button primary" type="button" data-next="assistant">Submit</button>
        </div>
      </section>
      <aside class="panel service-panel">
        <div class="notice">Please upload only documents related to the same administrative process.</div>
        <h3>Service Selection</h3>
        <div class="service-toggle">
          <button class="toggle-card ${state.service === "explain" ? "active" : ""}" type="button" data-service="explain">
            <strong>Explanation Mode</strong>
            Explains requested information, administrative logic, and supporting documents.
          </button>
          <button class="toggle-card ${state.service === "fill" ? "active" : ""}" type="button" data-service="fill">
            <strong>Fill-Out Mode</strong>
            Prepares completed forms using your validated student profile.
          </button>
        </div>
      </aside>
    </div>
  `;
}

function docItem(file, index) {
  return `
    <div class="doc-item">
      <div class="doc-meta">
        <strong>${escapeHtml(file.name)}</strong>
        <span>${fileSize(file.size)}</span>
      </div>
      <button class="icon-button" type="button" aria-label="Remove ${escapeHtml(file.name)}" data-remove-file="${index}">×</button>
    </div>
  `;
}

function assistantView() {
  return `
    <div class="assistant-layout">
      <aside class="panel guidance-panel">
        <h3>Guidance</h3>
        <div class="guidance-list">
          <div class="guidance-card"><strong>Why this is required</strong><p>Immigration authorities need proof of your current residential address.</p></div>
          <div class="guidance-card"><strong>Government requirement</strong><p>The address must match a recent utility bill or housing attestation.</p></div>
          <div class="guidance-card"><strong>Common mistake</strong><p>Do not use your school address unless it is your official residence.</p></div>
        </div>
      </aside>
      <section class="panel viewer-panel">
        <div class="viewer-toolbar">
          <button class="icon-button" type="button" aria-label="Previous page">‹</button>
          <strong>Page 1 of 4 · 125%</strong>
          <button class="icon-button" type="button" aria-label="Next page">›</button>
        </div>
        <div class="document-preview" aria-label="Document preview">
          <div class="preview-line short"></div>
          <div class="preview-line"></div>
          <div class="preview-line"></div>
          <div class="highlight-box">
            <strong>Current residential address</strong>
            <p>79 Avenue de la Republique, 75011 Paris</p>
          </div>
          <div class="preview-line"></div>
          <div class="preview-line short"></div>
          <div class="highlight-box">
            <strong>Supporting document needed</strong>
            <p>Proof of address dated within the last 3 months.</p>
          </div>
        </div>
        <div class="actions">
          <button class="button secondary" type="button" data-back="upload">Back</button>
          <button class="button primary" type="button" data-next="resources">Next Step: Find an Appointment</button>
        </div>
      </section>
      <aside class="panel suggestions-panel">
        <h3>AI Suggestions</h3>
        <div class="suggestion"><strong>Auto-filled</strong><p>Full name, nationality, phone number, and address are ready.</p></div>
        <div class="suggestion warning"><strong>Missing information</strong><p>Upload proof of financial resources before submission.</p></div>
        <div class="suggestion"><strong>Confidence</strong><p>Document completion score: 82%</p></div>
      </aside>
    </div>
  `;
}

function resourcesView() {
  return `
    <div class="resources-layout">
      <section class="panel resource-panel">
        <h2>Appointment Booking</h2>
        <div class="resource-row">
          <div>
            <strong>Prefecture Appointment - Paris</strong>
            <p>Book a residence permit appointment through the official Paris prefecture portal.</p>
          </div>
          <button class="button primary" type="button">Go to Website</button>
        </div>
        <h2>Required Documents</h2>
        <div class="checklist">
          <label><input type="checkbox" checked /> Passport / ID</label>
          <label><input type="checkbox" checked /> Proof of Address</label>
          <label><input type="checkbox" /> Completed Application Form</label>
          <label><input type="checkbox" /> Proof of Financial Resources</label>
        </div>
        <button class="button secondary" type="button">View Full Checklist</button>
        <div class="actions">
          <button class="button secondary" type="button" data-back="assistant">Back</button>
          <button class="button primary" type="button" data-next="personal">Back to Dashboard</button>
        </div>
      </section>
      <aside class="panel resource-panel">
        <h2>Useful Locations</h2>
        <div class="map-card">
          <div class="map-pin"><span>P</span></div>
          <strong>Paris Prefecture</strong>
          <span>1 Rue de Lutece, 75004 Paris</span>
        </div>
        <div class="actions">
          <button class="button secondary" type="button">Open in Google Maps</button>
          <button class="button primary" type="button">Get Directions</button>
        </div>
      </aside>
    </div>
  `;
}

function helpView() {
  return `
    <section class="panel help-panel">
      <div class="help-benefits">
        <div class="benefit"><strong>Get answers</strong><p>Ask trained consultants about your specific process.</p></div>
        <div class="benefit"><strong>Clarify doubts</strong><p>Review uncertain form sections before submission.</p></div>
        <div class="benefit"><strong>Move forward</strong><p>Reduce delays caused by missing or incorrect documents.</p></div>
      </div>
      <div class="actions">
        <button class="button primary" type="button" data-next="chat">Start a Chat</button>
      </div>
    </section>
  `;
}

function chatView() {
  return `
    <section class="panel chat-shell">
      <header class="chat-header">
        <button class="button secondary" type="button" data-back="help">Back</button>
        <strong>Chat with a Consultant</strong>
        <button class="button secondary" type="button" data-next="review">End Chat</button>
      </header>
      <div class="chat-body">
        <div class="message"><p>Hello Alexandre. I can help with your residence permit application.</p><small>10:24</small></div>
        <div class="message user"><p>I need to confirm which proof of address is accepted.</p><small>10:25</small></div>
        <div class="message"><p>A rental contract or recent electricity bill is usually accepted. Upload it in the same process folder.</p><small>10:26</small></div>
        <div class="typing">Consultant is typing...</div>
      </div>
      <footer class="chat-composer">
        <input id="chatInput" type="text" placeholder="Type your message..." />
        <button id="chatSend" class="button primary" type="button">Send</button>
      </footer>
    </section>
  `;
}

function reviewView() {
  return `
    <section class="panel help-panel">
      <div class="success-icon">✓</div>
      <h2>Thank you for chatting with us.</h2>
      <div class="rating" role="group" aria-label="Rating">
        ${[1, 2, 3, 4, 5].map((value) => `<button class="star ${state.rating >= value ? "active" : ""}" data-rating="${value}" type="button" aria-label="${value} star">${state.rating >= value ? "★" : "☆"}</button>`).join("")}
      </div>
      <div class="counter-group">
        <textarea id="feedback" maxlength="400" placeholder="Share your feedback..."></textarea>
        <div class="counter">0/400</div>
      </div>
      <div class="actions">
        <button class="button primary" type="button" data-next="thanks">Submit Review</button>
      </div>
    </section>
  `;
}

function thanksView() {
  return `
    <section class="panel success-state">
      <div class="success-icon">✓</div>
      <h2>Thank you! Your feedback helps us improve our service.</h2>
      <button class="button primary" type="button" data-next="personal">Back to Dashboard</button>
    </section>
  `;
}

function identitySvg() {
  return `
    <svg viewBox="0 0 360 260" role="img" aria-label="Identity document illustration">
      <rect x="42" y="46" width="276" height="168" rx="12" fill="#fff" stroke="#bdd0f5" stroke-width="3"/>
      <rect x="70" y="78" width="82" height="94" rx="8" fill="#dce8ff"/>
      <circle cx="111" cy="111" r="22" fill="#0f3d91"/>
      <path d="M77 172c8-28 60-28 68 0" fill="#0f3d91"/>
      <rect x="178" y="82" width="102" height="12" rx="6" fill="#0f3d91"/>
      <rect x="178" y="114" width="78" height="10" rx="5" fill="#b8c8e8"/>
      <rect x="178" y="143" width="112" height="10" rx="5" fill="#b8c8e8"/>
      <rect x="178" y="172" width="92" height="10" rx="5" fill="#b8c8e8"/>
      <circle cx="282" cy="58" r="30" fill="#127a5a"/>
      <path d="m268 58 9 9 19-22" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

function chatSvg() {
  return `
    <svg viewBox="0 0 220 150" role="img" aria-label="Conversation illustration">
      <rect x="22" y="24" width="130" height="72" rx="14" fill="#dce8ff" stroke="#9db7e7"/>
      <path d="M58 96 42 122 90 96" fill="#dce8ff"/>
      <rect x="50" y="48" width="76" height="8" rx="4" fill="#0f3d91"/>
      <rect x="50" y="68" width="58" height="8" rx="4" fill="#7896cd"/>
      <rect x="84" y="76" width="112" height="54" rx="14" fill="#fff" stroke="#bdd0f5"/>
      <path d="M158 130 184 142 176 125" fill="#fff"/>
      <rect x="112" y="96" width="54" height="8" rx="4" fill="#127a5a"/>
    </svg>
  `;
}

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => setRoute(item.dataset.route));
});

render();
