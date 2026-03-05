// assets/site.js

// ✅ Your Cloudflare Worker endpoint (already deployed)
const FORMS_ENDPOINT = "https://bold-frost-3e20.nexovianet.workers.dev";

// --- Helpers ---
function qs(id) {
  return document.getElementById(id);
}

function setStatus(form, msg) {
  const el = form.querySelector("[data-status]");
  if (el) el.textContent = msg || "";
}

function formToObject(form) {
  const data = new FormData(form);
  const obj = {};
  for (const [k, v] of data.entries()) obj[k] = String(v ?? "").trim();
  return obj;
}

async function submitForm(form, listName) {
  if (!FORMS_ENDPOINT) {
    setStatus(form, "Not live yet.");
    return;
  }

  const payload = formToObject(form);

  if (!payload.email) {
    setStatus(form, "Email required.");
    return;
  }

  setStatus(form, "Submitting...");
  try {
    const res = await fetch(FORMS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        list: listName,                 // "newsletter" or "self-care-lab"
        source: location.pathname,      // helps you track which page
        ...payload,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Request failed (${res.status})`);
    }

    form.reset();
    setStatus(form, "Done.");
  } catch (e) {
    // Show a short message to the user; detailed errors stay in console
    console.error(e);
    setStatus(form, "Error. Try again.");
  }
}

// --- Wire forms ---
document.addEventListener("DOMContentLoaded", () => {
  const newsletterForm = qs("newsletter-home");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitForm(newsletterForm, "newsletter");
    });
  }

  const labForm = qs("lab-waitlist");
  if (labForm) {
    labForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitForm(labForm, "self-care-lab");
    });
  }
});