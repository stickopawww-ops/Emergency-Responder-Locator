import { escapeHtml, mapIllustration } from "./shared.js";

export function renderAdminSignIn() {
  return;
}

export function renderAdminOtp() {
  return;
}

function incidentCard(incident) {
  return `<article class="incident-card card">
    <div class="incident-head"><span class="priority-pill ${incident.priority.toLowerCase()}">${escapeHtml(incident.priority)}</span><small>${escapeHtml(incident.time)}</small></div>
    <h2>${escapeHtml(incident.title)}</h2><p>${escapeHtml(incident.place)}</p>
    <div class="incident-foot"><span>${incident.unit ? `Assigned · ${escapeHtml(incident.unit)}` : "Awaiting assignment"}</span><span class="status ${incident.status === "Unassigned" ? "busy" : "available"}">${escapeHtml(incident.status)}</span></div>
    ${incident.status === "Unassigned" ? `<button type="button" class="secondary-button assign-button" data-assign="${escapeHtml(incident.id)}">Assign unit</button>` : ""}
  </article>`;
}

export function renderAdminLive(state, filter = "All active") {
  const incidents = state.admin.incidents.filter((incident) => incident.status !== "Resolved" && incident.status !== "False Alarm");
  const shown = filter === "Unassigned" ? incidents.filter((incident) => incident.status === "Unassigned") : incidents;
  const availableUnits = state.admin.team.filter((unit) => unit.status === "Available").length;
  document.querySelector('[data-summary="active"]').textContent = incidents.length;
  document.querySelector('[data-summary="unassigned"]').textContent = incidents.filter((incident) => incident.status === "Unassigned").length;
  document.querySelector('[data-summary="free"]').textContent = availableUnits;
  document.querySelectorAll("[data-admin-filter]").forEach((button) => {
    const selected = button.dataset.adminFilter === filter;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  document.querySelector("[data-incident-list]").innerHTML = shown.map(incidentCard).join("")
    || `<div class="empty-state card"><strong>No active incidents</strong><p>Nothing needs dispatch right now.</p></div>`;
}

export function renderAdminMap(state) {
  const selectedId = new URLSearchParams(location.search).get("unit");
  const selected = state.admin.team.find((unit) => unit.id === selectedId);
  document.querySelector("[data-map-content]").innerHTML = `${mapIllustration("Sample incident and unit locations")}
    <div class="map-pin-row">${state.admin.team.slice(0, 3).map((unit, index) => `<button type="button" class="map-marker marker-${index}" data-map-unit="${escapeHtml(unit.id)}" aria-label="Show ${escapeHtml(unit.name)} on map">${index === 0 ? "+" : index === 1 ? "◇" : "▣"}</button>`).join("")}</div>
    <div class="map-legend card"><strong>Map legend</strong><span><i class="legend-dot incident-dot"></i> Incident</span><span><i class="legend-dot unit-dot"></i> Responder unit</span><small>Positions are sample data, not live GPS.</small></div>`;
  const details = document.querySelector("[data-map-details]");
  details.classList.toggle("hidden", !selected);
  details.innerHTML = selected
    ? `<strong>${escapeHtml(selected.name)}</strong><span>${escapeHtml(selected.station)} · ${escapeHtml(selected.status)}</span><button type="button" class="quiet-button" data-action="clear-map-selection">Close</button>`
    : "";
}

export function renderAdminApprovals(state) {
  document.querySelector("[data-approval-count]").textContent = state.admin.approvals.length;
  document.querySelector("[data-approval-list]").innerHTML = state.admin.approvals.map((request) => `<article class="approval-request card" data-approval-id="${escapeHtml(request.id)}"><div class="approval-request-head"><span class="avatar small-avatar">${request.name.split(" ").map((part) => part[0]).join("")}</span><span><strong>${escapeHtml(request.name)}</strong><small>${escapeHtml(request.requested)}</small></span></div><div class="request-details"><strong>${escapeHtml(request.unit)}</strong><span>${escapeHtml(request.station)}</span></div><div class="approval-actions"><button type="button" class="primary-button" data-approval="approve" data-id="${escapeHtml(request.id)}">Approve</button><button type="button" class="danger-button" data-approval="reject" data-id="${escapeHtml(request.id)}">Reject</button></div></article>`).join("")
    || `<div class="empty-state card"><strong>All caught up</strong><p>There are no pending responder requests.</p></div>`;
}

export function renderAdminTeam(state, filter = "All") {
  const units = state.admin.team.filter((unit) => filter === "All" || unit.status === filter);
  document.querySelector("[data-team-count]").textContent = state.admin.team.length;
  document.querySelectorAll("[data-team-filter]").forEach((button) => {
    const selected = button.dataset.teamFilter === filter;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  document.querySelector("[data-team-list]").innerHTML = units.map((unit) => `<article class="team-card card"><div class="team-icon">♙</div><div class="team-info"><strong>${escapeHtml(unit.name)}</strong><span>${escapeHtml(unit.person)}</span><small>${escapeHtml(unit.station)}</small></div><span class="status ${unit.status === "Available" ? "available" : unit.status === "Busy" ? "busy" : "off"}">${escapeHtml(unit.status)}</span></article>`).join("")
    || `<div class="empty-state card"><strong>No units</strong><p>Nobody matches this filter.</p></div>`;
}

export function renderAdminHistory(state, tab = "Incident", statusFilter = "All", search = "") {
  const all = state.admin.incidents;
  const searchTerm = search.trim().toLowerCase();
  const rows = tab === "Activity Log"
    ? state.admin.logs.filter((entry) => `${entry.action} ${entry.time}`.toLowerCase().includes(searchTerm))
    : all.filter((incident) => (statusFilter === "All"
      ? incident.status === "Resolved" || incident.status === "False Alarm"
      : incident.status === statusFilter)
      && `${incident.title} ${incident.place} ${incident.unit} ${incident.id}`.toLowerCase().includes(searchTerm));
  const searchInput = document.querySelector('[data-search="admin-history"]');
  if (searchInput && searchInput.value !== search) searchInput.value = search;
  document.querySelectorAll("[data-history-tab]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.historyTab === tab);
  });
  const statusFilters = document.querySelector("[data-history-status-filters]");
  statusFilters.classList.toggle("hidden", tab !== "Incident");
  document.querySelectorAll("[data-history-filter]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.historyFilter === statusFilter);
  });
  document.querySelector("[data-history-results]").innerHTML = rows.map((entry) => tab === "Incident" ? `<article class="incident-card card"><div class="incident-head"><span class="status ${entry.status === "Resolved" ? "available" : "busy"}">${escapeHtml(entry.status)}</span><small>${escapeHtml(entry.time)}</small></div><h2>${escapeHtml(entry.title)}</h2><p>${escapeHtml(entry.place)}</p><div class="incident-foot"><span>${escapeHtml(entry.unit || "No unit assigned")}</span><span>${escapeHtml(entry.id)}</span></div></article>` : `<article class="activity-row card"><span class="activity-dot"></span><div><strong>${escapeHtml(entry.action)}</strong><small>${escapeHtml(entry.time)}</small></div></article>`).join("")
    || `<div class="empty-state card"><strong>No records yet</strong><p>Completed demo actions will appear here.</p></div>`;
}
