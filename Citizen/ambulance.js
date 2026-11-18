const ICONS = {
  backArrow: '<i class="fa-solid fa-arrow-left" aria-hidden="true"></i>',
  ambulance: '<i class="fa-solid fa-truck-medical" aria-hidden="true"></i>',
  navFind: '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>',
  navResponder: '<i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i>',
  navLog: '<i class="fa-solid fa-clipboard-list" aria-hidden="true"></i>'
};

const ambulances = [
  {
    id: 'amb-1',
    name: 'Ambulance 1',
    location: 'Ginatilan Rural Health Unit',
    status: 'Available',
    distance: '1.4 km'
  },
  {
    id: 'amb-2',
    name: 'Ambulance 2',
    location: 'Ginatilan Municipal Health Office',
    status: 'Busy',
    distance: '1.8 km'
  }
];

function initFrame2() {
  // Render Back Button Icon
  const backButton = document.getElementById('backBtn');
  backButton.innerHTML = ICONS.backArrow;
  backButton.addEventListener('click', () => {
    window.location.href = 'citizen.html';
  });

  // Render Ambulance Cards
  const listContainer = document.getElementById('ambulanceList');
  listContainer.innerHTML = ambulances.map(unit => {
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
  }).join('');

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
      alert(`Calling ${unitName}... Incident logged.`);
    }
  });
}

document.addEventListener('DOMContentLoaded', initFrame2);