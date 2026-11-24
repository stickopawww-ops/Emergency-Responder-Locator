const ICONS = {
  backArrow: '<i class="fa-solid fa-arrow-left" aria-hidden="true"></i>',
  ambulance: '<i class="fa-solid fa-truck-medical" aria-hidden="true"></i>',
  navFind: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"></circle><path d="M16 16L21 21"></path></svg>',
  navResponder: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9"></path><path d="M12 7v5l3 2"></path></svg>',
  navLog: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h9l3 3V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2z"></path><path d="M15 3.5v4h4"></path><path d="M8 11h8"></path><path d="M8 15h8"></path></svg>'
};

<<<<<<< HEAD
let ambulances = [];

async function loadAmbulances() {
  try {
    const response = await fetch("/api/public/responders");
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to load responders.");
    ambulances = data.responders.filter(unit =>
      unit.responder_type.toLowerCase().includes("ambulance")
    );
  } catch (error) {
    ambulances = [];
  }
  initFrame2();
}

function initFrame2() {
=======
async function initFrame2() {
>>>>>>> origin/main
  // Render Back Button Icon
  const backButton = document.getElementById('backBtn');
  backButton.innerHTML = ICONS.backArrow;
  backButton.addEventListener('click', () => {
    window.location.href = 'citizen.html';
  });

  const listContainer = document.getElementById('ambulanceList');
<<<<<<< HEAD
  listContainer.innerHTML = ambulances.length ? ambulances.map(unit => {
    const isAvailable = unit.status === 'Available';
    const badgeClass = isAvailable ? 'available' : 'busy';
    const statusDot = isAvailable ? '●' : '▲';

    return `
      <div class="responder-card">
        <div class="card-left">
          <div class="icon-box">${ICONS.ambulance}</div>
          <div class="card-info">
            <span class="responder-name">${unit.name}</span>
            <span class="responder-location">${unit.location}</span>
            <div class="status-row">
              <span class="badge ${badgeClass}">${statusDot} ${unit.status}</span>
              <span class="distance">${unit.distance}</span>
            </div>
          </div>
        </div>
        <button class="call-btn" data-name="${unit.name}">Call</button>
      </div>
    `;
  }).join('') : '<div class="responder-card"><div class="card-info"><span class="responder-name">No ambulances available</span></div></div>';
=======
  const feedback = document.createElement('p');
  feedback.className = 'feedback';
  feedback.setAttribute('aria-live', 'polite');
  feedback.hidden = true;
  listContainer.after(feedback);
  try {
    const responders = await EmergencyApi.request('/api/responders', { auth: false });
    const ambulances = responders.filter(unit => /ambulance|medical/i.test(`${unit.unitType} ${unit.unitName}`));
    if (!ambulances.length) {
      listContainer.textContent = 'No medical responders are currently listed.';
    } else {
      listContainer.replaceChildren();
      ambulances.forEach(unit => {
        const card = document.createElement('div');
        card.className = 'responder-card';
        const left = document.createElement('div');
        left.className = 'card-left';
        const icon = document.createElement('div');
        icon.className = 'icon-box';
        icon.innerHTML = ICONS.ambulance;
        const info = document.createElement('div');
        info.className = 'card-info';
        const name = document.createElement('span');
        name.className = 'responder-name';
        name.textContent = unit.unitName || unit.fullName;
        const location = document.createElement('span');
        location.className = 'responder-location';
        location.textContent = unit.baseStation || 'Base station not provided';
        const row = document.createElement('div');
        row.className = 'status-row';
        const status = document.createElement('span');
        status.className = `badge ${unit.availability.toLowerCase()}`;
        status.textContent = unit.availability;
        const distance = document.createElement('span');
        distance.className = 'distance';
        distance.textContent = unit.distanceKm == null ? '' : `${unit.distanceKm.toFixed(1)} km`;
        row.append(status, distance);
        info.append(name, location, row);
        left.append(icon, info);
        const call = document.createElement('button');
        call.className = 'call-btn';
        call.type = 'button';
        call.dataset.name = unit.unitName || unit.fullName;
        call.textContent = 'Call';
        card.append(left, call);
        listContainer.append(card);
      });
    }
  } catch (error) {
    listContainer.textContent = error.message;
  }
>>>>>>> origin/main

  // Render Bottom Nav
  const bottomNav = document.getElementById('bottomNav');
  bottomNav.innerHTML = `
<<<<<<< HEAD
    <a class="nav-item active" href="citizen.html">${ICONS.navFind}<span>Find</span></a>
=======
    <a class="nav-item active" href="citizen.html" aria-current="page">${ICONS.navFind}<span>Find</span></a>
>>>>>>> c15c58f9dfd149c3beb1cb2cc71cd0ae8bf35f38
    <a class="nav-item" href="responders.html">${ICONS.navResponder}<span>Responder</span></a>
    <a class="nav-item" href="log.html">${ICONS.navLog}<span>Log</span></a>
  `;

  listContainer.addEventListener('click', (e) => {
<<<<<<< HEAD
    if (e.target.classList.contains('call-btn')) {
      const unitName = e.target.getAttribute('data-name');
      fetch("/api/public/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Call for ${unitName}`,
          location: "Citizen request"
        })
      }).then(response => response.json()).then(() => {
        alert(`Calling ${unitName}... Incident logged.`);
      }).catch(() => {
        alert(`Calling ${unitName}... Backend unavailable.`);
      });
=======
    const button = e.target.closest('.call-btn');
    if (button) {
      EmergencyApi.reportCall(button, 'Medical', `Citizen requested ${button.dataset.name}.`, feedback);
>>>>>>> origin/main
    }
  });
}

document.addEventListener('DOMContentLoaded', loadAmbulances);