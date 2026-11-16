import { categories, outageResponder, responders } from "../data.js";
import { escapeHtml, mapIllustration, responderCard } from "./shared.js";

export function renderCitizenHome(state) {
  const records = responders.map((responder) => responder.id === "ambulance-1"
    ? { ...responder, status: state.responder.status === "Available" ? "Available" : "Busy" }
    : responder);
  const nearestAny = [records[0], records[1], records[3], records[4], records[5]];
  const counts = {
    Ambulance: records.filter((responder) => responder.category === "Ambulance" && responder.status === "Available").length,
    "Fire Station": records.filter((responder) => responder.category === "Fire Station" && responder.status === "Available").length,
    "Barangay Tanod": records.filter((responder) => responder.category === "Barangay Tanod" && responder.status === "Available").length,
    Police: records.filter((responder) => responder.category === "Police" && responder.status === "Available").length,
    Any: nearestAny.filter((responder) => responder.status === "Available").length
  };
  appCountElements().forEach((element) => {
    element.textContent = `${counts[element.dataset.count]} available`;
  });
}

function appCountElements() {
  return document.querySelectorAll("[data-count]");
}

function categoryResults(id, state) {
  const records = responders.map((responder) => responder.id === "ambulance-1"
    ? { ...responder, status: state.responder.status === "Available" ? "Available" : "Busy" }
    : responder);
  if (id === "outage") return [outageResponder];
  if (id === "nearest") return [records[0], records[1], records[3], records[4], records[5]];
  const selected = categories.find((item) => item.id === id);
  return records.filter((responder) => selected && responder.category === selected.category);
}

export function renderCitizenCategory(state, id) {
  const category = categories.find((item) => item.id === id);
  const title = id === "outage" ? "Power Outage" : id === "nearest" ? "Nearest Any" : `Nearest ${category ? category.label : "Responders"}`;
  const results = categoryResults(id, state);
  document.querySelector("[data-category-title]").textContent = title;
  document.querySelector("[data-map-slot]").innerHTML = mapIllustration(`${title} service area`);
  document.querySelector("[data-result-count]").textContent = `${results.length} results`;
  document.querySelector("[data-responder-results]").innerHTML = results.map(responderCard).join("");
}

export function renderCitizenDirectory(state, filter = "All") {
  const records = responders.map((responder) => responder.id === "ambulance-1"
    ? { ...responder, status: state.responder.status === "Available" ? "Available" : "Busy" }
    : responder);
  const filtered = records.filter((responder) => filter === "All" || responder.status === filter);
  document.querySelectorAll("[data-filter]").forEach((button) => {
    const selected = button.dataset.filter === filter;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  document.querySelectorAll("[data-filter-count]").forEach((element) => {
    const status = element.dataset.filterCount;
    element.textContent = status === "All" ? records.length : records.filter((responder) => responder.status === status).length;
  });
  document.querySelector("[data-directory-results]").innerHTML = filtered.map(responderCard).join("")
    || `<div class="empty-state card"><strong>No responders</strong><p>Nobody matches this filter.</p></div>`;
}

export function renderCitizenLog(state) {
  const calls = state.citizenCalls || [];
  document.querySelector("[data-call-log]").innerHTML = calls.length
    ? `<div class="call-history-list">${calls.map((call) => `<article class="history-card card"><div><strong>${escapeHtml(call.name)}</strong><small>${escapeHtml(call.station)}</small></div><span>${escapeHtml(call.time)}</span><p>Call attempt · no verified phone number configured</p></article>`).join("")}</div>`
    : `<div class="empty-state card"><span class="empty-symbol" aria-hidden="true">▤</span><strong>No incidents yet</strong><p>No calls yet. Find a responder and press Call to record one here.</p></div>`;
}
