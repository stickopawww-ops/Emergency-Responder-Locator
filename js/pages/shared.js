export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[character]));
}

export function brand() {
  return `<div class="brand"><span class="brand-mark" aria-hidden="true">+</span><span>Cebu Emergency Finder</span></div>`;
}

export function backButton(route = "#role") {
  return `<button class="back-link" type="button" data-nav="${route}" aria-label="Go back"><span aria-hidden="true">←</span> Back</button>`;
}

export function citizenNav(active) {
  const links = [["home", "Find", "⌕"], ["responders", "Responder", "♙"], ["log", "Log", "▤"]];
  return `<nav class="bottom-nav" aria-label="Citizen navigation">${links.map(([id, label, icon]) =>
    `<button type="button" data-nav="#citizen/${id}" ${active === id ? 'aria-current="page"' : ""}><span class="nav-icon" aria-hidden="true">${icon}</span>${label}</button>`
  ).join("")}</nav>`;
}

export function adminNav(active) {
  const links = [["live", "Live", "⌖"], ["map", "Map", "◇"], ["approvals", "Approval", "✓"], ["team", "Team", "♙"], ["history", "History", "▤"]];
  return `<nav class="bottom-nav admin-nav" aria-label="Dispatch navigation">${links.map(([id, label, icon]) =>
    `<button type="button" data-nav="#admin/${id}" ${active === id ? 'aria-current="page"' : ""}><span class="nav-icon" aria-hidden="true">${icon}</span>${label}</button>`
  ).join("")}</nav>`;
}

export function emergencyBanner() {
  return `<button class="emergency-banner" type="button" data-action="call-911">Life-threatening? Call <strong>911</strong> now</button>`;
}

export function responderCard(responder) {
  const statusClass = responder.status.toLowerCase().replace(/\s+/g, "-");
  return `<article class="responder-card card">
    <div class="responder-symbol" aria-hidden="true">${responder.category === "Ambulance" ? "+" : responder.category === "Fire Station" ? "◇" : responder.category === "Police" ? "▣" : "⌂"}</div>
    <div class="responder-info">
      <strong>${escapeHtml(responder.name)}</strong>
      <span>${escapeHtml(responder.station)}</span>
      <div class="responder-meta"><span class="status ${statusClass}">${escapeHtml(responder.status)}</span><span>${escapeHtml(responder.distance)}</span></div>
    </div>
    <button class="call-button" type="button" data-call="${escapeHtml(responder.id)}">Call</button>
  </article>`;
}

export function mapIllustration(label = "Schematic service area") {
  return `<div class="map-illustration" role="img" aria-label="${escapeHtml(label)}">
    <svg viewBox="0 0 360 160" aria-hidden="true">
      <path class="map-river" d="M-5 125 C56 82 73 153 126 116 S205 65 250 99 S316 128 365 82"/>
      <path class="map-road" d="M-10 38 C54 54 62 25 121 51 S218 71 260 40 S321 24 370 47"/>
      <path class="map-road secondary" d="M45 -10 C72 48 109 57 92 93 S104 140 146 170"/>
      <path class="map-road secondary" d="M209 -10 C193 34 222 62 204 91 S225 129 256 171"/>
      <path class="map-road" d="M-10 90 C44 76 95 83 145 77 S236 101 370 106"/>
      <circle cx="92" cy="68" r="8" class="map-pin"/><circle cx="263" cy="76" r="8" class="map-pin"/>
      <circle cx="177" cy="108" r="6" class="map-pin active"/>
      <text x="20" y="20">GINATILAN</text><text x="266" y="139">SAMBOAN</text>
    </svg>
    <span class="map-label">${escapeHtml(label)}</span>
    <small>Estimated station locations · Not live GPS</small>
  </div>`;
}
