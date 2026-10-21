const list = document.querySelector("#internship-list");
const loading = document.querySelector("#loading-state");
const errorState = document.querySelector("#error-state");
const errorMessage = document.querySelector("#error-message");
const emptyState = document.querySelector("#empty-state");
const select = document.querySelector("#internship-id");
const retryButton = document.querySelector("#retry-button");
const errorRetry = document.querySelector("#error-retry");
const form = document.querySelector("#application-form");
const submitButton = document.querySelector("#submit-button");
const formStatus = document.querySelector("#form-status");
let internships = [];

function clearChildren(node) { while (node.firstChild) node.removeChild(node.firstChild); }

function renderInternships(items) {
  clearChildren(list);
  clearChildren(select);
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose an internship";
  select.append(placeholder);

  for (const item of items) {
    const card = document.createElement("article");
    card.className = "internship-card";
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = item.domain;
    const title = document.createElement("h3");
    title.textContent = item.title;
    const details = document.createElement("div");
    details.className = "details";
    details.textContent = `${item.mode} · ${item.duration_weeks} weeks`;
    const bottom = document.createElement("div");
    bottom.className = "card-bottom";
    const status = document.createElement("span");
    status.className = item.applications_open ? "open-label" : "closed-label";
    status.textContent = item.applications_open ? "Applications open" : "Applications closed";
    bottom.append(status);
    if (item.applications_open) {
      const choose = document.createElement("button");
      choose.className = "text-button";
      choose.type = "button";
      choose.textContent = "Apply →";
      choose.addEventListener("click", () => {
        select.value = item.id;
        document.querySelector("#apply-title").scrollIntoView({ behavior: "smooth", block: "start" });
        select.focus();
      });
      bottom.append(choose);
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = `${item.title} (${item.mode})`;
      select.append(option);
    }
    card.append(tag, title, details, bottom);
    list.append(card);
  }
}

async function loadInternships() {
  loading.hidden = false;
  errorState.hidden = true;
  emptyState.hidden = true;
  list.setAttribute("aria-busy", "true");
  retryButton.disabled = true;
  try {
    const response = await fetch("/api/internships", { headers: { Accept: "application/json" } });
    const body = await response.json();
    if (!response.ok || !body.success || !Array.isArray(body.data)) throw new Error(body.error || "Unexpected server response.");
    internships = body.data;
    renderInternships(internships);
    emptyState.hidden = internships.length !== 0;
  } catch (error) {
    errorMessage.textContent = "We couldn't load internships. Check your connection and try again.";
    errorState.hidden = false;
    clearChildren(list);
  } finally {
    loading.hidden = true;
    list.setAttribute("aria-busy", "false");
    retryButton.disabled = false;
  }
}

retryButton.addEventListener("click", loadInternships);
errorRetry.addEventListener("click", loadInternships);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formStatus.textContent = "";
  formStatus.className = "form-status";
  const internshipId = select.value;
  const name = document.querySelector("#applicant-name").value.trim();
  const email = document.querySelector("#applicant-email").value.trim();
  if (!internshipId) return showFormMessage("Please choose an internship.", false);
  if (name.length < 2 || name.length > 80 || !/^[\p{L}\p{M} .'-]+$/u.test(name)) return showFormMessage("Enter a valid name (2–80 letters).", false);
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showFormMessage("Enter a valid email address.", false);

  submitButton.disabled = true;
  submitButton.textContent = "Submitting…";
  try {
    const response = await fetch(`/api/internships/${encodeURIComponent(internshipId)}/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ applicant_name: name, applicant_email: email })
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || "Application could not be submitted.");
    showFormMessage("Application submitted successfully! Your application has been recorded.", true);
    form.reset();
  } catch (error) {
    showFormMessage(error.message || "Network error. Please try again.", false);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit application";
  }
});

function showFormMessage(message, success) {
  formStatus.textContent = message;
  formStatus.className = `form-status ${success ? "success" : "failure"}`;
}
loadInternships();