import { outageResponder, responders } from "./data.js";
import { getState, resetState, subscribe, updateState } from "./store.js";
import { createMockService } from "./services/mock-service.js";
import { renderRoleSelection } from "./pages/role-selection.js";
import { renderCitizenCategory, renderCitizenDirectory, renderCitizenHome, renderCitizenLog } from "./pages/citizen.js";
import { renderResponderApproval, renderResponderHistory, renderResponderOtp, renderResponderProfile, renderResponderSignIn, renderResponderToday } from "./pages/responder.js";
import { renderAdminApprovals, renderAdminHistory, renderAdminLive, renderAdminMap, renderAdminOtp, renderAdminSignIn, renderAdminTeam } from "./pages/admin.js";

const app = document.getElementById("app");
const toast = document.getElementById("toast");
const services = createMockService({ getState, updateState });
const defaultFilters = { citizen: "All", adminIncidents: "All active", team: "All", historyTab: "Incident", historyStatus: "All", historySearch: "" };
let savedFilters = {};
try {
  savedFilters = JSON.parse(sessionStorage.getItem("screen-filters") || "{}");
} catch (error) {
  console.warn("Temporary screen filters could not be read; using defaults.", error);
}
const filters = { ...defaultFilters, ...savedFilters };
const appBase = new URL("../", import.meta.url);
const screenFiles = {
  role: "index.html",
  "citizen/home": "pages/citizen/home.html",
  "citizen/category": "pages/citizen/category.html",
  "citizen/responders": "pages/citizen/responders.html",
  "citizen/log": "pages/citizen/log.html",
  "responder/signin": "pages/responder/signin.html",
  "responder/otp": "pages/responder/otp.html",
  "responder/approval": "pages/responder/approval.html",
  "responder/today": "pages/responder/today.html",
  "responder/history": "pages/responder/history.html",
  "responder/profile": "pages/responder/profile.html",
  "admin/signin": "pages/admin/signin.html",
  "admin/otp": "pages/admin/otp.html",
  "admin/live": "pages/admin/live.html",
  "admin/map": "pages/admin/map.html",
  "admin/approvals": "pages/admin/approvals.html",
  "admin/team": "pages/admin/team.html",
  "admin/history": "pages/admin/history.html"
};
function readCountdown(key) {
  const saved = sessionStorage.getItem(key);
  if (saved === null) return 42;
  const seconds = Number(saved);
  return Number.isFinite(seconds) ? Math.max(seconds, 0) : 42;
}

let activeRoute = "role";
let toastTimer;
let countdownTimer;
let countdownRemaining = readCountdown("responder-code-countdown");
let adminOtpRemaining = readCountdown("admin-code-countdown");
let responderPhoneMask = sessionStorage.getItem("responder-phone-mask") || "";

function routeNow() {
  return activeRoute;
}

function navigate(route) {
  const [rawPath, query = ""] = route.replace(/^#\/?/, "").split("?");
  const routeParts = rawPath.split("/");
  const routeKey = routeParts.length > 2 ? routeParts.slice(0, 2).join("/") : rawPath || "role";
  const file = screenFiles[routeKey];
  if (!file) {
    notify("That screen is not available.");
    return;
  }
  const destination = new URL(file, appBase);
  if (routeParts.length > 2 && routeParts[1] === "category") {
    destination.searchParams.set("category", routeParts[2]);
  }
  if (query) {
    new URLSearchParams(query).forEach((value, key) => destination.searchParams.set(key, value));
  }
  if (destination.href === location.href) render();
  else location.href = destination.href;
}

function saveFilters() {
  sessionStorage.setItem("screen-filters", JSON.stringify(filters));
}

function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function render() {
  clearInterval(countdownTimer);
  const route = routeNow();
  const state = getState();
  const routeParts = route.split("/");
  const group = routeParts[0];
  const page = routeParts[1] || "";
  if (group === "citizen") {
    if (page === "home") renderCitizenHome(state);
    else if (page === "category") renderCitizenCategory(state, new URLSearchParams(location.search).get("category") || "nearest");
    else if (page === "responders") renderCitizenDirectory(state, filters.citizen);
    else if (page === "log") renderCitizenLog(state);
    else renderCitizenHome(state);
  } else if (group === "responder") {
    if (page === "signin") renderResponderSignIn();
    else if (page === "otp") {
      renderResponderOtp(responderPhoneMask);
      startCountdown("responder");
    } else if (page === "approval") renderResponderApproval(state, responderPhoneMask);
    else if (page === "today") renderResponderToday(state);
    else if (page === "history") renderResponderHistory();
    else if (page === "profile") renderResponderProfile(state, responderPhoneMask);
    else renderResponderSignIn();
  } else if (group === "admin") {
    if (page === "signin") renderAdminSignIn();
    else if (page === "otp") {
      renderAdminOtp();
      startCountdown("admin");
    } else if (page === "live") renderAdminLive(state, filters.adminIncidents);
    else if (page === "map") renderAdminMap(state);
    else if (page === "approvals") renderAdminApprovals(state);
    else if (page === "team") renderAdminTeam(state, filters.team);
    else if (page === "history") renderAdminHistory(state, filters.historyTab, filters.historyStatus, filters.historySearch);
    else renderAdminSignIn();
  } else {
    renderRoleSelection();
  }
}

function startCountdown(type) {
  let remaining = type === "admin" ? adminOtpRemaining : countdownRemaining;
  const selector = type === "admin" ? "[data-admin-countdown]" : "[data-countdown]";
  const button = type === "admin" ? document.getElementById("admin-resend-code") : document.getElementById("resend-code");
  const paint = () => {
    const target = document.querySelector(selector);
    if (target) target.textContent = `0:${String(Math.max(remaining, 0)).padStart(2, "0")}`;
    if (button) button.disabled = remaining > 0;
  };
  paint();
  countdownTimer = setInterval(() => {
    remaining -= 1;
    if (type === "admin") {
      adminOtpRemaining = remaining;
      sessionStorage.setItem("admin-code-countdown", String(Math.max(remaining, 0)));
    } else {
      countdownRemaining = remaining;
      sessionStorage.setItem("responder-code-countdown", String(Math.max(remaining, 0)));
    }
    paint();
    if (remaining <= 0) clearInterval(countdownTimer);
  }, 1000);
}

function pushLog(action) {
  const time = new Date().toLocaleString();
  updateState((state) => ({
    ...state,
    admin: { ...state.admin, logs: [{ action, time, id: `LOG-${Date.now()}` }, ...state.admin.logs] }
  }));
}

function normalizedPhone(value) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("63")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

function getOtp() {
  return [...document.querySelectorAll("[data-otp]")].map((input) => input.value).join("");
}

function focusOtp(index) {
  const inputs = [...document.querySelectorAll("[data-otp]")];
  if (inputs[index]) inputs[index].focus();
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function exportCsv() {
  const incidents = getState().admin.incidents;
  const rows = [["ID", "Incident", "Place", "Priority", "Status", "Unit", "Time"], ...incidents.map((incident) =>
    [incident.id, incident.title, incident.place, incident.priority, incident.status, incident.unit, incident.time]
  )];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  const link = document.createElement("a");
  const objectUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.href = objectUrl;
  link.download = "cebu-emergency-demo-report.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  notify("Demo report exported as CSV.");
}

function newIncident(title, priority = "High") {
  services.createIncident(title, priority);
  pushLog(`${title} created`);
  notify(`${title} added to dispatch queue.`);
}

function handleAction(action, target) {
  if (action === "go-role") navigate("#role");
  if (action === "voice-search") notify("Voice search is not available in this demo.");
  if (action === "call-911") {
    if (confirm("Open your phone app to call 911? Only continue if this is a real emergency.")) location.href = "tel:911";
  }
  if (action === "responder-send-code") {
    const input = document.getElementById("phone");
    const phone = normalizedPhone(input.value);
    const error = document.getElementById("phone-error");
    if (phone.length !== 10 || phone[0] !== "9") {
      error.textContent = "Enter a valid Philippine mobile number (10 digits beginning with 9).";
      input.focus();
      return;
    }
    responderPhoneMask = `+63 ${phone.slice(0, 3)} ••• •${phone.slice(-3)}`;
    sessionStorage.setItem("responder-phone-mask", responderPhoneMask);
    countdownRemaining = 42;
    sessionStorage.setItem("responder-code-countdown", "42");
    navigate("#responder/otp");
  }
  if (action === "responder-verify") {
    const otp = getOtp();
    const error = document.getElementById("otp-error");
    if (otp.length !== 4) {
      error.textContent = "Enter all four digits.";
      focusOtp(0);
    } else if (otp !== "1234") {
      error.textContent = "That code isn't correct. Try the demo code 1234.";
      document.querySelectorAll("[data-otp]").forEach((input) => { input.value = ""; });
      focusOtp(0);
    } else {
      clearInterval(countdownTimer);
      navigate("#responder/approval");
    }
  }
  if (action === "responder-resend") {
    if (countdownRemaining > 0) return;
    countdownRemaining = 42;
    sessionStorage.setItem("responder-code-countdown", "42");
    render();
    notify("Demo code resent: 1234.");
  }
  if (action === "simulate-approval") {
    services.setResponderApproved(true);
    notify("Demo: your unit has been approved.");
  }
  if (action === "contact-admin") notify("Demo only: ask your agency administrator to contact you.");
  if (action === "logout") {
    sessionStorage.removeItem("responder-phone-mask");
    responderPhoneMask = "";
    navigate("#role");
    notify("You have been logged out of the demo.");
  }
  if (action === "toggle-password") {
    const password = document.getElementById("admin-password");
    const visible = password.type === "password";
    password.type = visible ? "text" : "password";
    target.textContent = visible ? "Hide" : "Show";
    target.setAttribute("aria-label", visible ? "Hide password" : "Show password");
  }
  if (action === "forgot-password") notify("Password recovery requires an agency email service.");
  if (action === "admin-send-code") {
    const email = document.getElementById("admin-email");
    const password = document.getElementById("admin-password");
    const error = document.getElementById("admin-error");
    if (!email.value.trim() || !email.validity.valid || !password.value) {
      error.textContent = "Enter a valid work email and password.";
      return;
    }
    adminOtpRemaining = 42;
    sessionStorage.setItem("admin-code-countdown", "42");
    navigate("#admin/otp");
    notify("Demo verification code: 123456.");
  }
  if (action === "admin-verify") {
    const otp = getOtp();
    if (otp.length !== 6) document.getElementById("admin-otp-error").textContent = "Enter all six digits.";
    else if (otp !== "123456") {
      document.getElementById("admin-otp-error").textContent = "Incorrect demo code. Try 123456.";
      document.querySelectorAll("[data-otp]").forEach((input) => { input.value = ""; });
      focusOtp(0);
    } else {
      clearInterval(countdownTimer);
      navigate("#admin/live");
    }
  }
  if (action === "admin-resend") {
    if (adminOtpRemaining > 0) return;
    adminOtpRemaining = 42;
    sessionStorage.setItem("admin-code-countdown", "42");
    render();
    notify("Demo verification code resent: 123456.");
  }
  if (action === "alert-units") {
    pushLog("Sent alert to all units");
    notify("Demo alert sent to all responder units.");
  }
  if (action === "new-sos") newIncident("New SOS", "Urgent");
  if (action === "backup-request") {
    pushLog("Backup request created");
    notify("Demo backup request sent.");
  }
  if (action === "clear-map-selection") navigate("#admin/map");
  if (action === "add-responder") {
    const name = prompt("Responder name");
    if (name === null) return;
    const unitName = prompt("Unit name");
    if (unitName === null) return;
    if (!name.trim() || !unitName.trim()) {
      notify("Name and unit are required.");
      return;
    }
    const unit = { id: `unit-${Date.now()}`, name: unitName.trim(), person: name.trim(), station: "Station not specified", status: "Off" };
    services.addResponder(unit);
    pushLog(`Added responder ${name.trim()} (${unitName.trim()})`);
  }
  if (action === "export-csv") exportCsv();
}

function handleClick(event) {
  const nav = event.target.closest("[data-nav]");
  if (nav) {
    event.preventDefault();
    navigate(nav.dataset.nav);
    return;
  }
  const category = event.target.closest("[data-category]");
  if (category) {
    navigate(`#citizen/category/${category.dataset.category}`);
    return;
  }
  const call = event.target.closest("[data-call]");
  if (call) {
    const item = [...responders, outageResponder].find((responder) => responder.id === call.dataset.call);
    if (!item) return;
    services.recordCall(item);
    notify("Call attempt recorded. No verified unit phone number is configured.");
    return;
  }
  const filter = event.target.closest("[data-filter]");
  if (filter) {
    filters.citizen = filter.dataset.filter;
    saveFilters();
    render();
    return;
  }
  const adminFilter = event.target.closest("[data-admin-filter]");
  if (adminFilter) {
    filters.adminIncidents = adminFilter.dataset.adminFilter;
    saveFilters();
    render();
    return;
  }
  const teamFilter = event.target.closest("[data-team-filter]");
  if (teamFilter) {
    filters.team = teamFilter.dataset.teamFilter;
    saveFilters();
    render();
    return;
  }
  const historyTab = event.target.closest("[data-history-tab]");
  if (historyTab) {
    filters.historyTab = historyTab.dataset.historyTab;
    saveFilters();
    render();
    return;
  }
  const historyFilter = event.target.closest("[data-history-filter]");
  if (historyFilter) {
    filters.historyStatus = historyFilter.dataset.historyFilter;
    saveFilters();
    render();
    return;
  }
  const approval = event.target.closest("[data-approval]");
  if (approval) {
    const { id } = approval.dataset;
    const action = approval.dataset.approval;
    const request = services.approveRequest(id, action);
    if (!request) return;
    pushLog(`${action === "approve" ? "Approved" : "Rejected"} ${request.name}'s responder request`);
    notify(`${request.name}'s request ${action === "approve" ? "approved" : "rejected"}.`);
    return;
  }
  const assign = event.target.closest("[data-assign]");
  if (assign) {
    const availableUnit = services.assignIncident(assign.dataset.assign);
    if (!availableUnit) {
      notify("No available units to assign.");
      return;
    }
    pushLog(`Assigned ${availableUnit.name} to incident ${assign.dataset.assign}`);
    notify(`${availableUnit.name} assigned.`);
    return;
  }
  const mapUnit = event.target.closest("[data-map-unit]");
  if (mapUnit) {
    navigate(`#admin/map?unit=${encodeURIComponent(mapUnit.dataset.mapUnit)}`);
    return;
  }
  const setStatus = event.target.closest("[data-status]");
  if (setStatus) {
    const status = setStatus.dataset.status;
    services.setResponderStatus(status);
    notify(`Status updated to ${status.toLowerCase()}.`);
    return;
  }
  const actionButton = event.target.closest("[data-action]");
  if (actionButton) handleAction(actionButton.dataset.action, actionButton);
}

function handleInput(event) {
  const input = event.target;
  if (input.matches("[data-otp]")) {
    input.value = input.value.replace(/\D/g, "").slice(-1);
    if (input.value) focusOtp(Number(input.dataset.otp) + 1);
    return;
  }
  if (input.matches('[data-search="admin-history"]')) {
    filters.historySearch = input.value;
    saveFilters();
    const selectionStart = input.selectionStart;
    render();
    const replacement = document.querySelector('[data-search="admin-history"]');
    replacement.focus();
    replacement.setSelectionRange(selectionStart, selectionStart);
    return;
  }
  if (input.matches('[data-search="categories"]')) {
    const query = input.value.trim().toLowerCase();
    document.querySelectorAll(".category-card, .outage-card").forEach((card) => {
      card.classList.toggle("hidden", !card.textContent.toLowerCase().includes(query));
    });
  }
}

function handleKeydown(event) {
  if (event.target.matches("[data-otp]") && event.key === "Backspace" && !event.target.value) {
    focusOtp(Number(event.target.dataset.otp) - 1);
  }
}

function handlePaste(event) {
  if (!event.target.matches("[data-otp]")) return;
  const digits = event.clipboardData.getData("text").replace(/\D/g, "");
  if (!digits) return;
  event.preventDefault();
  const inputs = [...document.querySelectorAll("[data-otp]")];
  const start = Number(event.target.dataset.otp);
  digits.slice(0, inputs.length - start).split("").forEach((digit, offset) => {
    inputs[start + offset].value = digit;
  });
  focusOtp(Math.min(start + digits.length, inputs.length - 1));
}

export function startApp() {
  app.addEventListener("click", handleClick);
  app.addEventListener("input", handleInput);
  app.addEventListener("keydown", handleKeydown);
  app.addEventListener("paste", handlePaste);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && routeNow() !== "role") history.back();
  });
  subscribe(render);
  const legacyRoute = location.hash.replace(/^#\/?/, "");
  if (legacyRoute && legacyRoute !== "role") {
    navigate(`#${legacyRoute}`);
    return;
  }
  render();
}

export function startScreen(pageId) {
  activeRoute = pageId;
  startApp();
}

window.resetEmergencyFinderDemo = () => {
  resetState();
  Object.assign(filters, defaultFilters);
  sessionStorage.removeItem("screen-filters");
  sessionStorage.removeItem("responder-phone-mask");
  sessionStorage.removeItem("responder-code-countdown");
  sessionStorage.removeItem("admin-code-countdown");
  navigate("#role");
  notify("Demo data reset.");
};
