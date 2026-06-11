const state = {
  route: "login",
  lang: "en",
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

function t(key) {
  return copy[state.lang][key] || copy.en[key] || key;
}

function setRoute(route) {
  state.route = route;
  document.documentElement.lang = state.lang;
  title.textContent = t(route);
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
  app.querySelectorAll("[data-service]").forEach((button) => {
    button.addEventListener("click", () => {
      state.service = button.dataset.service;
      render();
    });
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

function loginView() {
  return `
    <section class="entry-card panel">
      <div>
        <p class="eyebrow">${t("app.name")}</p>
        <h1>${t("login")}</h1>
        <p>${state.lang === "fr" ? "Connectez-vous avec votre profil école pour démarrer votre onboarding personnalisé." : state.lang === "es" ? "Conéctate con tu perfil de la escuela para iniciar tu onboarding personalizado." : "Connect with your school profile to start your personalized onboarding."}</p>
      </div>
      <div class="login-actions">
        <button class="button primary" type="button" data-next="personal">${state.lang === "fr" ? "Se connecter" : state.lang === "es" ? "Conectar" : "Connect"}</button>
      </div>
    </section>
  `;
}

function personalView() {
  const fields = [
    ["firstName", state.lang === "fr" ? "Prénom" : state.lang === "es" ? "Nombre" : "First Name", "text"],
    ["lastName", state.lang === "fr" ? "Nom" : state.lang === "es" ? "Apellido" : "Last Name", "text"],
    ["phone", state.lang === "fr" ? "Numéro de téléphone" : state.lang === "es" ? "Número de teléfono" : "Phone Number", "tel"],
    ["passport", state.lang === "fr" ? "Passeport / ID" : state.lang === "es" ? "Pasaporte / ID" : "Passport / ID Number", "text"],
    ["nationality", state.lang === "fr" ? "Nationalité" : state.lang === "es" ? "Nacionalidad" : "Nationality", "text"],
    ["address", state.lang === "fr" ? "Adresse" : state.lang === "es" ? "Dirección" : "Address", "text", "full"]
  ];
  return `
    <div class="onboarding-heading">
      <p class="eyebrow">${state.lang === "fr" ? "Onboarding" : state.lang === "es" ? "Onboarding" : "Onboarding"}</p>
      <h1>${t("personal")}</h1>
    </div>
    <div class="split-layout">
      <aside class="panel illustration-panel">
        ${identitySvg()}
        <span class="school-badge">ESCP Business School</span>
      </aside>
      <section class="panel form-panel">
        <div class="notice">${state.lang === "fr" ? "Ces informations ont été préremplies par ESCP Business School. Vérifiez-les et corrigez les informations incorrectes." : state.lang === "es" ? "Esta información ha sido rellenada previamente por ESCP Business School. Revísala y corrige cualquier dato incorrecto." : "This information has been pre-filled by ESCP Business School. Please review and update any incorrect information."}</div>
        <div class="form-grid">
          ${fields
            .map(([key, label, type, size]) => `
              <div class="field ${size || ""}">
                <label for="${key}">${label}</label>
                <div class="input-row">
                  <input id="${key}" type="${type}" value="${state.profile[key]}" aria-describedby="${key}Status" />
                  <button class="edit-icon" type="button" aria-label="Edit ${label}">✎</button>
                </div>
                <span class="field-status" id="${key}Status">${state.lang === "fr" ? "Format validé" : state.lang === "es" ? "Formato validado" : "Validated format"}</span>
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
          <h2>${t("context")}</h2>
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
      <aside class="panel service-panel">
        <div class="notice">${state.lang === "fr" ? "Importez uniquement des documents liés au même processus administratif." : state.lang === "es" ? "Sube solo documentos relacionados con el mismo proceso administrativo." : "Please upload only documents related to the same administrative process."}</div>
        <h3>${state.lang === "fr" ? "Sélection du service" : state.lang === "es" ? "Selección de servicio" : "Service Selection"}</h3>
        <div class="service-toggle">
          <button class="toggle-card ${state.service === "explain" ? "active" : ""}" type="button" data-service="explain">
            <strong>${state.lang === "fr" ? "Mode explication" : state.lang === "es" ? "Modo explicación" : "Explanation Mode"}</strong>
            ${state.lang === "fr" ? "Explique les informations demandées, la logique administrative et les justificatifs." : state.lang === "es" ? "Explica la información solicitada, la lógica administrativa y los documentos de apoyo." : "Explains requested information, administrative logic, and supporting documents."}
          </button>
          <button class="toggle-card ${state.service === "fill" ? "active" : ""}" type="button" data-service="fill">
            <strong>${state.lang === "fr" ? "Mode remplissage" : state.lang === "es" ? "Modo rellenar" : "Fill-Out Mode"}</strong>
            ${state.lang === "fr" ? "Prépare les formulaires complétés avec votre profil étudiant validé." : state.lang === "es" ? "Prepara formularios completos con tu perfil validado." : "Prepares completed forms using your validated student profile."}
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
        <h3>${state.lang === "fr" ? "Guidage" : state.lang === "es" ? "Guía" : "Guidance"}</h3>
        <div class="guidance-list">
          <div class="guidance-card"><strong>${state.lang === "fr" ? "Pourquoi c’est requis" : state.lang === "es" ? "Por qué se requiere" : "Why this is required"}</strong><p>${state.lang === "fr" ? "Les autorités d’immigration ont besoin d’une preuve de votre adresse actuelle." : state.lang === "es" ? "Las autoridades de inmigración necesitan prueba de tu residencia actual." : "Immigration authorities need proof of your current residential address."}</p></div>
          <div class="guidance-card"><strong>${state.lang === "fr" ? "Exigence administrative" : state.lang === "es" ? "Requisito administrativo" : "Government requirement"}</strong><p>${state.lang === "fr" ? "L’adresse doit correspondre à une facture récente ou une attestation de logement." : state.lang === "es" ? "La dirección debe coincidir con una factura reciente o certificado de alojamiento." : "The address must match a recent utility bill or housing attestation."}</p></div>
          <div class="guidance-card"><strong>${state.lang === "fr" ? "Erreur fréquente" : state.lang === "es" ? "Error común" : "Common mistake"}</strong><p>${state.lang === "fr" ? "N’utilisez pas l’adresse de l’école sauf si c’est votre résidence officielle." : state.lang === "es" ? "No uses la dirección de la escuela salvo que sea tu residencia oficial." : "Do not use your school address unless it is your official residence."}</p></div>
        </div>
      </aside>
      <section class="panel viewer-panel">
        <div class="viewer-toolbar">
          <button class="icon-button" type="button" aria-label="Previous page">‹</button>
          <strong>${state.lang === "fr" ? "Page 1 sur 4" : state.lang === "es" ? "Página 1 de 4" : "Page 1 of 4"} · 125%</strong>
          <button class="icon-button" type="button" aria-label="Next page">›</button>
        </div>
        <div class="document-preview" aria-label="Document preview">
          <div class="preview-line short"></div>
          <div class="preview-line"></div>
          <div class="preview-line"></div>
          <div class="highlight-box">
            <strong>${state.lang === "fr" ? "Adresse de résidence actuelle" : state.lang === "es" ? "Dirección residencial actual" : "Current residential address"}</strong>
            <p>79 Avenue de la Republique, 75011 Paris</p>
          </div>
          <div class="preview-line"></div>
          <div class="preview-line short"></div>
          <div class="highlight-box">
            <strong>${state.lang === "fr" ? "Justificatif requis" : state.lang === "es" ? "Documento requerido" : "Supporting document needed"}</strong>
            <p>${state.lang === "fr" ? "Justificatif de domicile de moins de 3 mois." : state.lang === "es" ? "Comprobante de domicilio de los últimos 3 meses." : "Proof of address dated within the last 3 months."}</p>
          </div>
        </div>
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
    <div class="resources-layout">
      <section class="panel resource-panel">
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
      <aside class="panel resource-panel">
        <h2>${state.lang === "fr" ? "Lieux utiles" : state.lang === "es" ? "Ubicaciones útiles" : "Useful Locations"}</h2>
        <div class="map-card">
          <div class="map-pin"><span>P</span></div>
          <strong>Paris Prefecture</strong>
          <span>1 Rue de Lutece, 75004 Paris</span>
        </div>
        <div class="actions">
          <button class="button secondary" type="button">${state.lang === "fr" ? "Ouvrir dans Google Maps" : state.lang === "es" ? "Abrir en Google Maps" : "Open in Google Maps"}</button>
          <button class="button primary" type="button">${state.lang === "fr" ? "Itinéraire" : state.lang === "es" ? "Indicaciones" : "Get Directions"}</button>
        </div>
      </aside>
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
  return `
    <section class="panel help-panel settings-panel">
      <div>
        <h2>${state.lang === "fr" ? "Préférences" : state.lang === "es" ? "Preferencias" : "Preferences"}</h2>
        <p>${state.lang === "fr" ? "Choisissez la langue de l’interface." : state.lang === "es" ? "Elige el idioma de la interfaz." : "Choose the interface language."}</p>
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
        <p>${state.profile.firstName} ${state.profile.lastName} · ESCP Business School</p>
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

setRoute("login");
