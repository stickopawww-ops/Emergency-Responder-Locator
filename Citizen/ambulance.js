const ICONS = {
  backArrow: '<i class="fa-solid fa-arrow-left" aria-hidden="true"></i>',
  ambulance: '<i class="fa-solid fa-truck-medical" aria-hidden="true"></i>',
  navFind: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"></circle><path d="M16 16L21 21"></path></svg>',
  navResponder: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9"></path><path d="M12 7v5l3 2"></path></svg>',
  navLog: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h9l3 3V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2z"></path><path d="M15 3.5v4h4"></path><path d="M8 11h8"></path><path d="M8 15h8"></path></svg>'
};

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
  // Render Back Button Icon
  const backButton = document.getElementById('backBtn');
  backButton.innerHTML = ICONS.backArrow;
  backButton.addEventListener('click', () => {
    window.location.href = 'citizen.html';
  });

  // Render Ambulance Cards
  const listContainer = document.getElementById('ambulanceList');
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

  // Render Bottom Nav
  const bottomNav = document.getElementById('bottomNav');
  bottomNav.innerHTML = `
    <div class="nav-item active">${ICONS.navFind}<span>Find</span></div>
    <div class="nav-item">${ICONS.navResponder}<span>Responder</span></div>
    <div class="nav-item">${ICONS.navLog}<span>Log</span></div>
  `;

  // Attach Call Button Event
  listContainer.addEventListener('click', (e) => {
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
    }
  });
}

document.addEventListener('DOMContentLoaded', loadAmbulances);