const screen = document.querySelector("#screen");

const state = {
  route: "validation",
  service: "explanation",
  files: [],
  rating: 0
};

const profile = {
  firstName: "Alexandre",
  lastName: "Martin",
  phone: "+33 6 12 34 56 78",
  passport: "PA1234567",
  nationality: "France",
  address: "79 Avenue de la Republique, 75011 Paris"
};

const routes = {
  validation: renderValidation,
  context: renderContext,
  upload: renderUpload,
  document: renderDocument,
  resources: renderResources,
  help: renderHelp,
  chat: renderChat,
  review: renderReview,
  thanks: renderThanks
};

function go(route) {
  state.route = route;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function render() {
  screen.innerHTML = routes[state.route]();
  bindEvents();
}

function bindEvents() {
  screen.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => go(button.dataset.route));
  });

  screen.querySelectorAll("[data-service]").forEach((button) => {
    button.addEventListener("click", () => {
      state.service = button.dataset.service;
      render();
    });
  });

  const input = screen.querySelector("#documents");
  const uploadArea = screen.querySelector(".upload-area");
  if (input && uploadArea) {
    input.addEventListener("change", () => addFiles(input.files));
    uploadArea.addEventListener("dragover", (event) => {
      event.preventDefault();
      uploadArea.classList.add("dragover");
    });
    uploadArea.addEventListener("dragleave", () => uploadArea.classList.remove("dragover"));
    uploadArea.addEventListener("drop", (event) => {
      event.preventDefault();
      uploadArea.classList.remove("dragover");
      addFiles(event.dataTransfer.files);
    });
  }

  screen.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      state.files.splice(Number(button.dataset.remove), 1);
      render();
    });
  });

  const messageInput = screen.querySelector("#message");
  const sendButton = screen.querySelector("#send");
  if (messageInput && sendButton) {
    sendButton.addEventListener("click", () => addMessage(messageInput));
    messageInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") addMessage(messageInput);
    });
  }

  screen.querySelectorAll("[data-rating]").forEach((button) => {
    button.addEventListener("click", () => {
      state.rating = Number(button.dataset.rating);
      render();
    });
  });
}

function addFiles(fileList) {
  Array.from(fileList).forEach((file) => {
    state.files.push({ name: file.name, size: file.size });
  });
  render();
}

function addMessage(input) {
  const text = input.value.trim();
  if (!text) return;
  const messages = screen.querySelector(".messages");
  messages.insertAdjacentHTML("beforeend", `<div class="message user">${escapeHtml(text)}</div>`);
  input.value = "";
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function formatSize(bytes) {
  if (!bytes) return "0 KB";
  const size = bytes / 1024;
  return size > 1024 ? `${(size / 1024).toFixed(1)} MB` : `${size.toFixed(1)} KB`;
}

function renderValidation() {
  return `
    <section class="screen">
      <header class="screen-header single">
        <h1>Validation of Information</h1>
      </header>
      <p class="organisation-note">This information was provided by your organisation.</p>
      <div class="form-grid">
        ${field("firstName", "First Name", profile.firstName)}
        ${field("lastName", "Last Name", profile.lastName)}
        ${field("phone", "Phone Number", profile.phone)}
        ${field("passport", "ID Number/Passport", profile.passport)}
        ${field("nationality", "Country of Nationality", profile.nationality)}
        ${field("address", "Address", profile.address, true)}
      </div>
      <div class="actions">
        <button class="button primary" type="button" data-route="context">Validate and continue</button>
      </div>
    </section>
  `;
}

function field(id, label, value, wide = false) {
  return `
    <div class="field ${wide ? "full" : ""}">
      <label for="${id}">${label}</label>
      <input id="${id}" type="text" value="${value}" />
    </div>
  `;
}

function renderContext() {
  return `
    <section class="screen">
      <header class="screen-header">
        <button class="button secondary" type="button" data-route="validation">Back</button>
        <button class="button primary" type="button" data-route="upload">Submit</button>
      </header>
      <h1>Situation Context</h1>
      <p>Describe your situation in one or two sentences.</p>
      <textarea aria-label="Describe your situation"></textarea>
    </section>
  `;
}

function renderUpload() {
  return `
    <section class="screen">
      <header class="screen-header single">
        <h1>Upload Documents</h1>
      </header>
      <div class="upload-layout">
        <div>
          <label class="upload-area" for="documents">
            <input id="documents" type="file" multiple />
            <span><strong>Upload one or more documents</strong><br />Drag files here or browse from your computer.</span>
          </label>
          <div class="file-list">
            ${state.files.length ? state.files.map(fileRow).join("") : `<p class="muted">No documents uploaded.</p>`}
          </div>
        </div>
        <aside>
          <p class="notice">Upload documents from the same process.</p>
          <h2>Service</h2>
          <div class="toggle-group">
            <button class="toggle ${state.service === "explanation" ? "active" : ""}" type="button" data-service="explanation">Explanation</button>
            <button class="toggle ${state.service === "fillout" ? "active" : ""}" type="button" data-service="fillout">Fill out</button>
          </div>
        </aside>
      </div>
      <div class="actions">
        <button class="button primary" type="button" data-route="document">Submit</button>
      </div>
    </section>
  `;
}

function fileRow(file, index) {
  return `
    <div class="file-row">
      <div><strong>${escapeHtml(file.name)}</strong><span>${formatSize(file.size)}</span></div>
      <button class="button secondary" type="button" data-remove="${index}">Remove</button>
    </div>
  `;
}

function renderDocument() {
  return `
    <section class="screen">
      <header class="screen-header single">
        <h1>${state.service === "fillout" ? "Fill Out View" : "Explanation View"}</h1>
      </header>
      <div class="document-layout">
        <aside class="panel">
          <h2>Explanation</h2>
          <p>This section asks for your current address because the administration needs proof of residence.</p>
          <p>Make sure the information matches the documents uploaded for this process.</p>
        </aside>
        <div>
          <div class="pdf-viewer" aria-label="PDF document">
            <div class="pdf-line short"></div>
            <div class="pdf-line"></div>
            <div class="highlight">
              <strong>Current address</strong>
              <p>${profile.address}</p>
            </div>
            <div class="pdf-line"></div>
            <div class="pdf-line short"></div>
            <div class="highlight">
              <strong>Supporting document</strong>
              <p>Proof of address</p>
            </div>
          </div>
          <div class="actions">
            <button class="button primary" type="button" data-route="resources">Next step: Find an appointment</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderResources() {
  return `
    <section class="screen">
      <header class="screen-header single">
        <h1>Next Steps & Resources</h1>
      </header>
      <div class="resources">
        <div>
          <h2>Appointment links</h2>
          <div class="resource-row">
            <strong>Prefecture Appointment - Paris</strong>
            <p>Official appointment page for residence permit procedures.</p>
            <button class="button primary" type="button">Open link</button>
          </div>
          <h2>Required document list</h2>
          <ul class="required-list">
            <li>Passport / ID</li>
            <li>Proof of address</li>
            <li>Completed application form</li>
            <li>Proof of financial resources</li>
          </ul>
        </div>
        <aside>
          <h2>Location/map section</h2>
          <div class="map">
            <strong>Paris Prefecture</strong>
            <span>1 Rue de Lutece, 75004 Paris</span>
          </div>
        </aside>
      </div>
      <div class="actions">
        <button class="button secondary" type="button" data-route="help">Help</button>
        <button class="button primary" type="button" data-route="validation">Back to dashboard</button>
      </div>
    </section>
  `;
}

function renderHelp() {
  return `
    <section class="screen">
      <header class="screen-header single">
        <h1>Help</h1>
      </header>
      <button class="button primary" type="button" data-route="chat">Start a chat</button>
    </section>
  `;
}

function renderChat() {
  return `
    <section class="screen">
      <header class="screen-header">
        <button class="button secondary" type="button" data-route="help">Back</button>
        <h1>Live consultant chat</h1>
        <button class="button primary" type="button" data-route="review">End chat</button>
      </header>
      <div class="chat-box">
        <div class="messages">
          <div class="message">Hello, how can I help?</div>
          <div class="message user">I need help with my application.</div>
        </div>
        <div class="composer">
          <input id="message" type="text" placeholder="Type your message..." />
          <button id="send" class="button primary" type="button">Send</button>
        </div>
      </div>
    </section>
  `;
}

function renderReview() {
  return `
    <section class="screen">
      <header class="screen-header single">
        <h1>Review</h1>
      </header>
      <p>Rate your experience and leave feedback.</p>
      <div class="rating" aria-label="Rating">
        ${[1, 2, 3, 4, 5].map((value) => `<button class="star ${state.rating >= value ? "active" : ""}" type="button" data-rating="${value}" aria-label="${value} star">${state.rating >= value ? "★" : "☆"}</button>`).join("")}
      </div>
      <textarea aria-label="Feedback"></textarea>
      <div class="actions">
        <button class="button primary" type="button" data-route="thanks">Submit review</button>
      </div>
    </section>
  `;
}

function renderThanks() {
  return `
    <section class="screen success">
      <div>
        <div class="success-mark">✓</div>
        <h1>Thank you</h1>
        <p>Your feedback has been submitted.</p>
        <button class="button primary" type="button" data-route="validation">Back to dashboard</button>
      </div>
    </section>
  `;
}

render();
