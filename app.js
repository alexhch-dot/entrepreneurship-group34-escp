const state = {
  route: "login",
  lang: "en",
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

const copy = {
  en: {
    "app.name": "International Student Administrative Assistant",
    "nav.documents": "Documents",
    "nav.resources": "Next Steps",
    "nav.support": "Support",
    "nav.settings": "Settings",
    login: "Connect to your student assistant",
    personal: "Let's validate your information",
    context: "Help us understand your situation",
    upload: "Upload your document(s)",
    assistant: "Interactive Document Assistant",
    resources: "Next Steps & Useful Resources",
    help: "Help & Support",
    chat: "Chat with a Consultant",
    review: "Review & Feedback",
    thanks: "Thank you",
    settings: "Settings"
  },
  fr: {
    "app.name": "Assistant administratif pour étudiants internationaux",
    "nav.documents": "Documents",
    "nav.resources": "Étapes suivantes",
    "nav.support": "Assistance",
    "nav.settings": "Paramètres",
    login: "Connectez-vous à votre assistant étudiant",
    personal: "Validons vos informations",
    context: "Aidez-nous à comprendre votre situation",
    upload: "Importez vos document(s)",
    assistant: "Assistant de document interactif",
    resources: "Étapes suivantes et ressources utiles",
    help: "Aide et assistance",
    chat: "Discussion avec un consultant",
    review: "Avis et retour",
    thanks: "Merci",
    settings: "Paramètres"
  },
  es: {
    "app.name": "Asistente administrativo para estudiantes internacionales",
    "nav.documents": "Documentos",
    "nav.resources": "Siguientes pasos",
    "nav.support": "Soporte",
    "nav.settings": "Ajustes",
    login: "Conéctate a tu asistente estudiantil",
    personal: "Validemos tu información",
    context: "Ayúdanos a entender tu situación",
    upload: "Sube tu(s) documento(s)",
    assistant: "Asistente interactivo de documentos",
    resources: "Siguientes pasos y recursos útiles",
    help: "Ayuda y soporte",
    chat: "Chat con un consultor",
    review: "Reseña y comentarios",
    thanks: "Gracias",
    settings: "Ajustes"
  }
};

const progressOrder = ["personal", "context"];

const app = document.querySelector("#app");
const title = document.querySelector("#screenTitle");
const appShell = document.querySelector(".app-shell");
const sidebarStudentName = document.querySelector("#sidebarStudentName");
const profileButton = document.querySelector(".profile-button");
let openExplanationIcon = null;

function t(key) {
  return copy[state.lang][key] || copy.en[key] || key;
}

function setRoute(route) {
  closeExplanation();
  state.route = route;
  document.documentElement.lang = state.lang;
  title.textContent = t(route);
  updateStudentIdentity();
  const entryRoute = ["login", "personal", "context"].includes(route);
  appShell.classList.toggle("entry-mode", entryRoute);
  document.querySelectorAll(".nav-item").forEach((item) => {
    const groupRoute = item.dataset.route;
    const active =
      groupRoute === route ||
      (groupRoute === "upload" && route === "assistant") ||
      (groupRoute === "help" && ["chat", "review", "thanks"].includes(route));
    item.classList.toggle("active", active);
  });
  document.querySelector(".progress-wrap").hidden = !["personal", "context"].includes(route);
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === state.lang);
  });
  updateProgress(route);
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateStudentIdentity() {
  const fullName = `${state.profile.firstName} ${state.profile.lastName}`.trim();
  const initials = [state.profile.firstName, state.profile.lastName]
    .filter(Boolean)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  sidebarStudentName.textContent = fullName || "Student";
  profileButton.textContent = initials || "ST";
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
    thanks: thanksView,
    settings: settingsView,
    login: loginView
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
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.onclick = () => {
      state.lang = button.dataset.lang;
      setRoute(state.route);
    };
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
      const [removedFile] = state.files.splice(Number(button.dataset.removeFile), 1);
      if (removedFile?.url) URL.revokeObjectURL(removedFile.url);
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

  app.querySelectorAll("[data-profile-field]").forEach((input) => {
    input.addEventListener("input", () => {
      state.profile[input.dataset.profileField] = input.value;
      updateStudentIdentity();
    });
  });

  app.querySelectorAll("[data-explanation]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleExplanation(button);
    });
  });
}

function updateCounter(textarea) {
  const counter = textarea.closest(".counter-group")?.querySelector(".counter");
  if (counter) counter.textContent = `${textarea.value.length}/${textarea.maxLength || 600}`;
}

function addFiles(fileList) {
  const accepted = ["application/pdf", "image/png", "image/jpeg"];
  Array.from(fileList)
    .filter((file) => accepted.includes(file.type) || /\.(pdf|png|jpe?g)$/i.test(file.name))
    .forEach((file) => {
      state.files.push({
        name: file.name,
        size: file.size,
        type: file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
        url: URL.createObjectURL(file)
      });
    });
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

function explanationButton(title, body) {
  return `
    <button
      class="explanation-trigger"
      type="button"
      aria-label="${escapeHtml(title)}"
      data-explanation-title="${escapeHtml(title)}"
      data-explanation="${escapeHtml(body)}">?</button>
  `;
}

function toggleExplanation(button) {
  if (openExplanationIcon === button) {
    closeExplanation();
    return;
  }
  closeExplanation();
  openExplanationIcon = button;
  const popup = document.createElement("div");
  popup.className = "explanation-popup";
  popup.setAttribute("role", "tooltip");
  popup.innerHTML = `
    <strong>${button.dataset.explanationTitle}</strong>
    <p>${button.dataset.explanation}</p>
  `;
  document.body.appendChild(popup);
  const iconRect = button.getBoundingClientRect();
  const popupRect = popup.getBoundingClientRect();
  const left = Math.min(iconRect.left + window.scrollX, window.scrollX + window.innerWidth - popupRect.width - 14);
  const top = iconRect.bottom + window.scrollY + 8;
  popup.style.left = `${Math.max(14, left)}px`;
  popup.style.top = `${top}px`;
  button.classList.add("is-open");
}

function closeExplanation() {
  document.querySelector(".explanation-popup")?.remove();
  openExplanationIcon?.classList.remove("is-open");
  openExplanationIcon = null;
}

function loginView() {
  const documents = [
    state.lang === "fr" ? "Titre de séjour" : state.lang === "es" ? "Permiso de residencia" : "Residence Permit",
    state.lang === "fr" ? "Renouvellement visa" : state.lang === "es" ? "Renovación de visa" : "Visa Renewal",
    state.lang === "fr" ? "Assurance santé" : state.lang === "es" ? "Seguro médico" : "Health Insurance",
    state.lang === "fr" ? "Inscription logement" : state.lang === "es" ? "Registro de vivienda" : "Housing Registration",
    state.lang === "fr" ? "Compte bancaire" : state.lang === "es" ? "Cuenta bancaria" : "Bank Account",
    state.lang === "fr" ? "Documents CAF" : state.lang === "es" ? "Documentos CAF" : "CAF Documents"
  ];
  const galleryCards = [...documents, ...documents]
    .map((documentName) => `
      <div class="gallery-card">
        <span>${documentName}</span>
      </div>
    `)
    .join("");
  return `
    <section class="connection-screen">
      <div class="document-gallery" aria-label="Supported administrative documents">
        <div class="gallery-track">
          ${galleryCards}
        </div>
      </div>
      <div class="connection-content">
        <h1>AI assistant for administrative</h1>
        <div class="login-actions">
          <button class="button primary" type="button" data-next="personal">${state.lang === "fr" ? "Connexion avec l’organisation" : state.lang === "es" ? "Conectar con organización" : "Connect with organization"}</button>
          <button class="button secondary" type="button" data-next="upload">${state.lang === "fr" ? "Créer un compte" : state.lang === "es" ? "Crear cuenta" : "Create account"}</button>
        </div>
      </div>
    </section>
  `;
}

function personalView() {
  const fields = [
    ["firstName", state.lang === "fr" ? "Prénom" : state.lang === "es" ? "Nombre" : "First Name", "text"],
    ["lastName", state.lang === "fr" ? "Nom" : state.lang === "es" ? "Apellido" : "Last Name", "text"],
    ["nationality", state.lang === "fr" ? "Nationalité" : state.lang === "es" ? "Nacionalidad" : "Nationality", "text"],
    ["phone", state.lang === "fr" ? "Numéro de téléphone" : state.lang === "es" ? "Número de teléfono" : "Phone Number", "tel"],
    ["passport", state.lang === "fr" ? "Passeport / ID" : state.lang === "es" ? "Pasaporte / ID" : "Passport / ID Number", "text"],
    ["address", state.lang === "fr" ? "Adresse" : state.lang === "es" ? "Dirección" : "Address", "text", "full"]
  ];
  return `
    <div class="split-layout">
      <aside class="panel illustration-panel">
        ${identitySvg()}
      </aside>
      <section class="panel form-panel">
        <h2 class="card-title">${t("personal")}</h2>
        <div class="notice">${state.lang === "fr" ? "Ces informations ont été préremplies par" : state.lang === "es" ? "Esta información ha sido rellenada previamente por" : "This information has been pre-filled by"} <strong class="organization-name">ESCP Business School</strong>. ${state.lang === "fr" ? "Vérifiez-les et corrigez les informations incorrectes." : state.lang === "es" ? "Revísala y corrige cualquier dato incorrecto." : "Please review and update any incorrect information."}</div>
        <div class="form-grid">
          ${fields
            .map(([key, label, type, size]) => `
              <div class="field ${size || ""}">
                <label for="${key}">${label}</label>
                <div class="input-row">
                  <input id="${key}" type="${type}" value="${state.profile[key]}" aria-describedby="${key}Status" />
                  <button class="edit-icon" type="button" aria-label="Edit ${label}">✎</button>
                </div>
                ${explanationButton(
                  state.lang === "fr" ? `Pourquoi ${label} est requis ?` : state.lang === "es" ? `¿Por qué se requiere ${label}?` : `Why is ${label} required?`,
                  state.lang === "fr"
                    ? "Cette information est utilisée pour préremplir les formulaires administratifs et vérifier la cohérence avec vos documents."
                    : state.lang === "es"
                      ? "Esta información se usa para rellenar formularios administrativos y comprobar que coincide con tus documentos."
                      : "This information is used to pre-fill administrative forms and check consistency with your documents."
                )}
                <span class="field-error" id="${key}Status" hidden><span aria-hidden="true">!</span>${state.lang === "fr" ? "Format incorrect" : state.lang === "es" ? "Formato incorrecto" : "Invalid format"}</span>
              </div>
            `)
            .join("")}
        </div>
        <div class="actions">
          <button class="button primary" type="button" data-next="context">${state.lang === "fr" ? "Valider et continuer" : state.lang === "es" ? "Validar y continuar" : "Validate and Continue"}</button>
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
          <p>${state.lang === "fr" ? "Décrivez brièvement votre situation pour recevoir les recommandations les plus adaptées." : state.lang === "es" ? "Describe brevemente tu situación para recibir las recomendaciones más relevantes." : "Briefly describe your situation so we can provide the most relevant guidance and recommendations."}</p>
        </div>
      </div>
      <div class="panel chat-input-panel">
        <div class="example-list">
          <button class="example-pill" type="button">${state.lang === "fr" ? "Je demande mon premier titre de séjour." : state.lang === "es" ? "Estoy solicitando mi primer permiso de residencia." : "I am applying for my first residence permit."}</button>
          <button class="example-pill" type="button">${state.lang === "fr" ? "J’ai récemment déménagé et je dois mettre à jour mon adresse." : state.lang === "es" ? "Me mudé recientemente y necesito actualizar mi dirección." : "I recently moved and need to update my address."}</button>
        </div>
        <div class="counter-group">
          <textarea id="contextText" maxlength="600" placeholder="${state.lang === "fr" ? "Écrivez votre message ici..." : state.lang === "es" ? "Escribe tu mensaje aquí..." : "Type your message here..."}"></textarea>
          <div class="counter">0/600</div>
        </div>
        <div class="actions">
          <button class="button secondary" type="button" data-back="personal">${state.lang === "fr" ? "Retour" : state.lang === "es" ? "Atrás" : "Back"}</button>
          <button class="button primary" type="button" data-next="upload">${state.lang === "fr" ? "Terminer l’onboarding" : state.lang === "es" ? "Finalizar onboarding" : "Finish Onboarding"}</button>
        </div>
      </div>
    </section>
  `;
}

function uploadView() {
  return `
    <div class="upload-layout">
      <section class="panel service-panel upload-service-panel">
        <div class="notice">${state.lang === "fr" ? "Importez uniquement des documents liés au même processus administratif." : state.lang === "es" ? "Sube solo documentos relacionados con el mismo proceso administrativo." : "Please upload only documents related to the same administrative process."}</div>
        <h3>${state.lang === "fr" ? "Analyse du document" : state.lang === "es" ? "Análisis del documento" : "Document analysis"}</h3>
        <p class="service-description">${state.lang === "fr" ? "Après l’import, l’assistant affichera votre document et expliquera les sections importantes directement dessus." : state.lang === "es" ? "Después de subirlo, el asistente mostrará tu documento y explicará las secciones importantes directamente sobre él." : "After upload, the assistant will display your document and explain the important sections directly on it."}</p>
      </section>
      <section class="panel form-panel">
        <label class="upload-zone" for="fileInput">
          <input id="fileInput" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" />
          <span>
            <strong>${state.lang === "fr" ? "Déposez vos fichiers ici" : state.lang === "es" ? "Arrastra los archivos aquí" : "Drag and drop files here"}</strong><br />
            ${state.lang === "fr" ? "Les fichiers PDF, PNG et JPG sont acceptés. Vous pouvez importer plusieurs fichiers." : state.lang === "es" ? "Se admiten archivos PDF, PNG y JPG. Puedes subir varios archivos." : "PDF, PNG, and JPG files are supported. Multiple files can be uploaded."}
          </span>
        </label>
        <div class="document-list">
          ${state.files.length ? state.files.map((file, index) => docItem(file, index)).join("") : `<p class="muted">${state.lang === "fr" ? "Aucun document importé." : state.lang === "es" ? "Aún no hay documentos subidos." : "No documents uploaded yet."}</p>`}
        </div>
        <div class="actions">
          <button class="button primary" type="button" data-next="assistant">${state.lang === "fr" ? "Envoyer" : state.lang === "es" ? "Enviar" : "Submit"}</button>
        </div>
      </section>
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

function uploadedDocumentPreview() {
  const file = state.files[0];
  if (!file) {
    return `
      <div class="document-preview empty-document-preview" aria-label="Document preview">
        <p>${state.lang === "fr" ? "Aucun document importé. Retournez à l’étape précédente pour ajouter un PDF, PNG ou JPG." : state.lang === "es" ? "No se ha subido ningún documento. Vuelve al paso anterior para añadir un PDF, PNG o JPG." : "No document uploaded yet. Go back to add a PDF, PNG, or JPG."}</p>
      </div>
    `;
  }
  const fileName = escapeHtml(file.name);
  const fileUrl = escapeHtml(file.url);
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  const preview = isPdf
    ? `<iframe class="uploaded-document-frame" src="${fileUrl}" title="${fileName}"></iframe>`
    : `<img class="uploaded-document-image" src="${fileUrl}" alt="${fileName}" />`;
  return `
    <div class="document-preview uploaded-document-preview" aria-label="Document preview">
      <div class="uploaded-document-header">
        <strong>${fileName}</strong>
        <span>${fileSize(file.size)}</span>
      </div>
      <div class="uploaded-document-stage">
        ${preview}
        <div class="document-overlay-note explainable">
          <strong>${state.lang === "fr" ? "Zone à vérifier" : state.lang === "es" ? "Área para revisar" : "Section to review"}</strong>
          ${explanationButton("Why is this section highlighted?", "The assistant uses this area to connect the uploaded document with the information required in the administrative process.")}
        </div>
      </div>
    </div>
  `;
}

function assistantView() {
  return `
    <div class="assistant-layout">
      <aside class="panel guidance-panel">
        <h3>${state.lang === "fr" ? "Guidage" : state.lang === "es" ? "Guía" : "Guidance"}</h3>
        <div class="guidance-list">
          <div class="guidance-card explainable"><strong>${state.lang === "fr" ? "Pourquoi c’est requis" : state.lang === "es" ? "Por qué se requiere" : "Why this is required"}</strong><p>${state.lang === "fr" ? "Les autorités d’immigration ont besoin d’une preuve de votre adresse actuelle." : state.lang === "es" ? "Las autoridades de inmigración necesitan prueba de tu residencia actual." : "Immigration authorities need proof of your current residential address."}</p>${explanationButton("Residence context", "This section connects your uploaded proof of address with the address requested by the residence permit application.")}</div>
          <div class="guidance-card explainable"><strong>${state.lang === "fr" ? "Exigence administrative" : state.lang === "es" ? "Requisito administrativo" : "Government requirement"}</strong><p>${state.lang === "fr" ? "L’adresse doit correspondre à une facture récente ou une attestation de logement." : state.lang === "es" ? "La dirección debe coincidir con una factura reciente o certificado de alojamiento." : "The address must match a recent utility bill or housing attestation."}</p>${explanationButton("Administrative source", "The requirement comes from government document checks and helps avoid appointment rejection.")}</div>
          <div class="guidance-card explainable"><strong>${state.lang === "fr" ? "Erreur fréquente" : state.lang === "es" ? "Error común" : "Common mistake"}</strong><p>${state.lang === "fr" ? "N’utilisez pas l’adresse de l’école sauf si c’est votre résidence officielle." : state.lang === "es" ? "No uses la dirección de la escuela salvo que sea tu residencia oficial." : "Do not use your school address unless it is your official residence."}</p>${explanationButton("Common mistake", "School addresses are often rejected unless they are listed as your official housing address.")}</div>
        </div>
      </aside>
      <section class="panel viewer-panel">
        <div class="viewer-toolbar">
          <button class="icon-button" type="button" aria-label="Previous page">‹</button>
          <strong>${state.lang === "fr" ? "Page 1 sur 4" : state.lang === "es" ? "Página 1 de 4" : "Page 1 of 4"} · 125%</strong>
          <button class="icon-button" type="button" aria-label="Next page">›</button>
        </div>
        ${uploadedDocumentPreview()}
        <div class="actions">
          <button class="button secondary" type="button" data-back="upload">${state.lang === "fr" ? "Retour" : state.lang === "es" ? "Atrás" : "Back"}</button>
          <button class="button primary" type="button" data-next="resources">${state.lang === "fr" ? "Étape suivante : trouver un rendez-vous" : state.lang === "es" ? "Siguiente paso: encontrar una cita" : "Next Step: Find an Appointment"}</button>
        </div>
      </section>
      <aside class="panel suggestions-panel">
        <h3>${state.lang === "fr" ? "Suggestions IA" : state.lang === "es" ? "Sugerencias de IA" : "AI Suggestions"}</h3>
        <div class="suggestion"><strong>${state.lang === "fr" ? "Prérempli" : state.lang === "es" ? "Autocompletado" : "Auto-filled"}</strong><p>${state.lang === "fr" ? "Nom, nationalité, téléphone et adresse sont prêts." : state.lang === "es" ? "Nombre, nacionalidad, teléfono y dirección están listos." : "Full name, nationality, phone number, and address are ready."}</p></div>
        <div class="suggestion warning"><strong>${state.lang === "fr" ? "Information manquante" : state.lang === "es" ? "Información faltante" : "Missing information"}</strong><p>${state.lang === "fr" ? "Importez une preuve de ressources financières avant l’envoi." : state.lang === "es" ? "Sube una prueba de recursos financieros antes de enviar." : "Upload proof of financial resources before submission."}</p></div>
        <div class="suggestion"><strong>${state.lang === "fr" ? "Confiance" : state.lang === "es" ? "Confianza" : "Confidence"}</strong><p>${state.lang === "fr" ? "Score de complétion : 82%" : state.lang === "es" ? "Puntuación de finalización: 82%" : "Document completion score: 82%"}</p></div>
      </aside>
    </div>
  `;
}

function resourcesView() {
  return `
    <div class="resources-layout resources-map-first">
      <section class="panel resource-panel resources-map-panel">
        <h2>${state.lang === "fr" ? "Lieux utiles" : state.lang === "es" ? "Ubicaciones útiles" : "Useful Locations"}</h2>
        <div class="map-card">
          <iframe
            title="Paris Prefecture map"
            src="https://www.google.com/maps?q=1%20Rue%20de%20Lut%C3%A8ce%2C%2075004%20Paris&output=embed"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen>
          </iframe>
          <div class="map-location">
            <strong>Paris Prefecture</strong>
            <span>1 Rue de Lutece, 75004 Paris</span>
          </div>
        </div>
        <div class="actions">
          <a class="button secondary" href="https://www.google.com/maps/search/?api=1&query=1%20Rue%20de%20Lut%C3%A8ce%2C%2075004%20Paris" target="_blank" rel="noreferrer">${state.lang === "fr" ? "Ouvrir dans Google Maps" : state.lang === "es" ? "Abrir en Google Maps" : "Open in Google Maps"}</a>
          <a class="button primary" href="https://www.google.com/maps/dir/?api=1&destination=1%20Rue%20de%20Lut%C3%A8ce%2C%2075004%20Paris" target="_blank" rel="noreferrer">${state.lang === "fr" ? "Itinéraire" : state.lang === "es" ? "Indicaciones" : "Get Directions"}</a>
        </div>
      </section>
      <section class="panel resource-panel resources-info-panel">
        <h2>${state.lang === "fr" ? "Prise de rendez-vous" : state.lang === "es" ? "Reserva de cita" : "Appointment Booking"}</h2>
        <div class="resource-row">
          <div>
            <strong>Prefecture Appointment - Paris</strong>
            <p>${state.lang === "fr" ? "Réservez un rendez-vous pour le titre de séjour via le portail officiel de la préfecture." : state.lang === "es" ? "Reserva una cita de permiso de residencia en el portal oficial de la prefectura." : "Book a residence permit appointment through the official Paris prefecture portal."}</p>
          </div>
          <button class="button primary" type="button">${state.lang === "fr" ? "Ouvrir le site" : state.lang === "es" ? "Ir al sitio" : "Go to Website"}</button>
        </div>
        <h2>${state.lang === "fr" ? "Documents requis" : state.lang === "es" ? "Documentos requeridos" : "Required Documents"}</h2>
        <div class="checklist">
          <label><input type="checkbox" checked /> ${state.lang === "fr" ? "Passeport / ID" : state.lang === "es" ? "Pasaporte / ID" : "Passport / ID"}</label>
          <label><input type="checkbox" checked /> ${state.lang === "fr" ? "Justificatif de domicile" : state.lang === "es" ? "Comprobante de domicilio" : "Proof of Address"}</label>
          <label><input type="checkbox" /> ${state.lang === "fr" ? "Formulaire complété" : state.lang === "es" ? "Formulario completado" : "Completed Application Form"}</label>
          <label><input type="checkbox" /> ${state.lang === "fr" ? "Preuve de ressources financières" : state.lang === "es" ? "Prueba de recursos financieros" : "Proof of Financial Resources"}</label>
        </div>
        <button class="button secondary" type="button">${state.lang === "fr" ? "Voir la checklist complète" : state.lang === "es" ? "Ver lista completa" : "View Full Checklist"}</button>
        <div class="actions">
          <button class="button secondary" type="button" data-back="assistant">${state.lang === "fr" ? "Retour" : state.lang === "es" ? "Atrás" : "Back"}</button>
          <button class="button primary" type="button" data-next="upload">${state.lang === "fr" ? "Retour au tableau de bord" : state.lang === "es" ? "Volver al panel" : "Back to Dashboard"}</button>
        </div>
      </section>
    </div>
  `;
}

function helpView() {
  return `
    <section class="panel help-panel">
      <div class="help-benefits">
        <div class="benefit"><strong>${state.lang === "fr" ? "Obtenir des réponses" : state.lang === "es" ? "Obtener respuestas" : "Get answers"}</strong><p>${state.lang === "fr" ? "Posez vos questions à des consultants formés." : state.lang === "es" ? "Consulta a especialistas sobre tu proceso." : "Ask trained consultants about your specific process."}</p></div>
        <div class="benefit"><strong>${state.lang === "fr" ? "Clarifier les doutes" : state.lang === "es" ? "Aclarar dudas" : "Clarify doubts"}</strong><p>${state.lang === "fr" ? "Vérifiez les sections incertaines avant l’envoi." : state.lang === "es" ? "Revisa secciones dudosas antes de enviar." : "Review uncertain form sections before submission."}</p></div>
        <div class="benefit"><strong>${state.lang === "fr" ? "Avancer" : state.lang === "es" ? "Avanzar" : "Move forward"}</strong><p>${state.lang === "fr" ? "Réduisez les retards liés aux documents incorrects." : state.lang === "es" ? "Reduce retrasos por documentos faltantes o incorrectos." : "Reduce delays caused by missing or incorrect documents."}</p></div>
      </div>
      <div class="actions">
        <button class="button primary" type="button" data-next="chat">${state.lang === "fr" ? "Démarrer le chat" : state.lang === "es" ? "Iniciar chat" : "Start a Chat"}</button>
      </div>
    </section>
  `;
}

function chatView() {
  return `
    <section class="panel chat-shell">
      <header class="chat-header">
        <button class="button secondary" type="button" data-back="help">${state.lang === "fr" ? "Retour" : state.lang === "es" ? "Atrás" : "Back"}</button>
        <strong>${t("chat")}</strong>
        <button class="button secondary" type="button" data-next="review">${state.lang === "fr" ? "Terminer" : state.lang === "es" ? "Finalizar" : "End Chat"}</button>
      </header>
      <div class="chat-body">
        <div class="message"><p>${state.lang === "fr" ? "Bonjour Alexandre. Je peux vous aider avec votre demande de titre de séjour." : state.lang === "es" ? "Hola Alexandre. Puedo ayudarte con tu permiso de residencia." : "Hello Alexandre. I can help with your residence permit application."}</p><small>10:24</small></div>
        <div class="message user"><p>${state.lang === "fr" ? "Je dois confirmer quel justificatif de domicile est accepté." : state.lang === "es" ? "Necesito confirmar qué comprobante de domicilio se acepta." : "I need to confirm which proof of address is accepted."}</p><small>10:25</small></div>
        <div class="message"><p>${state.lang === "fr" ? "Un contrat de location ou une facture récente est généralement accepté." : state.lang === "es" ? "Normalmente se acepta un contrato de alquiler o una factura reciente." : "A rental contract or recent electricity bill is usually accepted. Upload it in the same process folder."}</p><small>10:26</small></div>
        <div class="typing">${state.lang === "fr" ? "Le consultant écrit..." : state.lang === "es" ? "El consultor está escribiendo..." : "Consultant is typing..."}</div>
      </div>
      <footer class="chat-composer">
        <input id="chatInput" type="text" placeholder="${state.lang === "fr" ? "Écrivez votre message..." : state.lang === "es" ? "Escribe tu mensaje..." : "Type your message..."}" />
        <button id="chatSend" class="button primary" type="button">${state.lang === "fr" ? "Envoyer" : state.lang === "es" ? "Enviar" : "Send"}</button>
      </footer>
    </section>
  `;
}

function reviewView() {
  return `
    <section class="panel help-panel">
      <div class="success-icon">✓</div>
      <h2>${state.lang === "fr" ? "Merci d’avoir discuté avec nous." : state.lang === "es" ? "Gracias por chatear con nosotros." : "Thank you for chatting with us."}</h2>
      <div class="rating" role="group" aria-label="Rating">
        ${[1, 2, 3, 4, 5].map((value) => `<button class="star ${state.rating >= value ? "active" : ""}" data-rating="${value}" type="button" aria-label="${value} star">${state.rating >= value ? "★" : "☆"}</button>`).join("")}
      </div>
      <div class="counter-group">
        <textarea id="feedback" maxlength="400" placeholder="${state.lang === "fr" ? "Partagez votre avis..." : state.lang === "es" ? "Comparte tus comentarios..." : "Share your feedback..."}"></textarea>
        <div class="counter">0/400</div>
      </div>
      <div class="actions">
        <button class="button primary" type="button" data-next="thanks">${state.lang === "fr" ? "Envoyer l’avis" : state.lang === "es" ? "Enviar reseña" : "Submit Review"}</button>
      </div>
    </section>
  `;
}

function thanksView() {
  return `
    <section class="panel success-state">
      <div class="success-icon">✓</div>
      <h2>${state.lang === "fr" ? "Merci ! Votre avis nous aide à améliorer notre service." : state.lang === "es" ? "¡Gracias! Tus comentarios nos ayudan a mejorar el servicio." : "Thank you! Your feedback helps us improve our service."}</h2>
      <button class="button primary" type="button" data-next="upload">${state.lang === "fr" ? "Retour au tableau de bord" : state.lang === "es" ? "Volver al panel" : "Back to Dashboard"}</button>
    </section>
  `;
}

function settingsView() {
  const settingsFields = [
    ["firstName", state.lang === "fr" ? "Prénom" : state.lang === "es" ? "Nombre" : "First Name", "text"],
    ["lastName", state.lang === "fr" ? "Nom" : state.lang === "es" ? "Apellido" : "Last Name", "text"],
    ["nationality", state.lang === "fr" ? "Nationalité" : state.lang === "es" ? "Nacionalidad" : "Nationality", "text"],
    ["phone", state.lang === "fr" ? "Numéro de téléphone" : state.lang === "es" ? "Número de teléfono" : "Phone Number", "tel"],
    ["passport", state.lang === "fr" ? "Passeport / ID" : state.lang === "es" ? "Pasaporte / ID" : "Passport / ID Number", "text"],
    ["address", state.lang === "fr" ? "Adresse" : state.lang === "es" ? "Dirección" : "Address", "text", "full"]
  ];
  return `
    <section class="panel help-panel settings-panel">
      <div>
        <h2>${state.lang === "fr" ? "Préférences" : state.lang === "es" ? "Preferencias" : "Preferences"}</h2>
        <p>${state.lang === "fr" ? "Modifiez vos informations et choisissez la langue de l’interface." : state.lang === "es" ? "Modifica tu información y elige el idioma de la interfaz." : "Edit your information and choose the interface language."}</p>
      </div>
      <div class="settings-row">
        <strong>${state.lang === "fr" ? "Langue" : state.lang === "es" ? "Idioma" : "Language"}</strong>
        <div class="settings-language">
          <button class="button ${state.lang === "en" ? "primary" : "secondary"}" type="button" data-lang="en">English</button>
          <button class="button ${state.lang === "fr" ? "primary" : "secondary"}" type="button" data-lang="fr">Français</button>
          <button class="button ${state.lang === "es" ? "primary" : "secondary"}" type="button" data-lang="es">Español</button>
        </div>
      </div>
      <div class="settings-row">
        <strong>${state.lang === "fr" ? "Profil" : state.lang === "es" ? "Perfil" : "Profile"}</strong>
        <div class="form-grid settings-profile-grid">
          ${settingsFields
            .map(([key, label, type, size]) => `
              <div class="field ${size || ""}">
                <label for="settings-${key}">${label}</label>
                <input id="settings-${key}" type="${type}" value="${escapeHtml(state.profile[key])}" data-profile-field="${key}" />
                ${explanationButton(
                  state.lang === "fr" ? `Modifier ${label}` : state.lang === "es" ? `Editar ${label}` : `Edit ${label}`,
                  state.lang === "fr"
                    ? "Cette valeur met à jour votre profil et sera réutilisée dans les formulaires."
                    : state.lang === "es"
                      ? "Este valor actualiza tu perfil y se reutilizará en los formularios."
                      : "This value updates your profile and will be reused in forms."
                )}
              </div>
            `)
            .join("")}
        </div>
      </div>
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

document.addEventListener("click", (event) => {
  if (event.target.closest(".explanation-popup")) return;
  closeExplanation();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeExplanation();
});

setRoute("login");
