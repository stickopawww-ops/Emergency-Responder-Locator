import { mapIllustration } from "./shared.js";

export function renderResponderSignIn() {
  return;
}

function maskedPhone(phone) {
  if (!phone) return "+63 ••• ••• ••••";
  if (phone.includes("•")) return phone;
  return `+63 ${phone.slice(0, 3)} ••• •${phone.slice(-3)}`;
}

export function renderResponderOtp(phone) {
  document.querySelector("[data-masked-phone]").textContent = maskedPhone(phone);
}

export function renderResponderApproval(state, phone) {
  const approved = state.responder.approved;
  document.querySelector("[data-approval-mark]").textContent = approved ? "✓" : "⌛";
  document.querySelector("[data-approval-title]").textContent = approved ? "You're approved" : "Waiting for approval";
  document.querySelector("[data-approval-description]").textContent = approved
    ? "Your unit is approved. Start when you are ready to take calls."
    : "An admin has to confirm you before your unit goes live. This keeps fake units off the map.";
  document.querySelector('[data-progress="verified"] [data-masked-phone]').textContent = maskedPhone(phone);
  const steps = ["unit", "review", "start"];
  steps.forEach((step, index) => {
    const item = document.querySelector(`[data-progress="${step}"]`);
    const complete = approved;
    item.classList.toggle("completed", complete);
    item.classList.toggle("current", !approved && index === 0);
    item.querySelector(".progress-icon").textContent = complete ? "✓" : !approved && index === 0 ? "•" : "";
  });
  document.querySelector("[data-review-detail]").textContent = approved ? "Approved for demo" : "Usually within a day";
  document.querySelector("[data-start-button]").classList.toggle("hidden", !approved);
  document.querySelector("[data-approval-demo]").classList.toggle("hidden", approved);
}

export function renderResponderToday(state) {
  const status = state.responder.status || "Available";
  const statusClass = status.toLowerCase().replace(/\s/g, "-");
  document.querySelector("[data-status-label]").textContent = status;
  const badge = document.querySelector("[data-status-badge]");
  badge.textContent = status;
  badge.className = `status status-${statusClass}`;
  document.querySelectorAll("[data-status]").forEach((button) => {
    const selected = button.dataset.status === status;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  document.querySelector("[data-availability-content]").innerHTML = status === "Available"
    ? `${mapIllustration("Responder service area")}<div class="empty-state card active-call-empty"><strong>No active calls</strong><p>You'll see an assigned call here.</p></div>`
    : `<div class="unavailable-card card"><span>⏸</span><strong>You will not get calls</strong><p>Switch to Available when your unit is ready to respond.</p></div>`;
}

export function renderResponderHistory() {
  return;
}

export function renderResponderProfile(state, phone) {
  document.querySelector('[data-masked-phone]').textContent = maskedPhone(phone);
  document.querySelector("[data-account-status]").textContent = state.responder.approved ? "Approved" : "Pending admin approval";
}
