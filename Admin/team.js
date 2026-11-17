const team = [
  { name: "Ambulance 1", location: "Ginatilan Rural Health Unit", status: "Available" },
  { name: "Ambulance 1", location: "Ginatilan Municipal Health Office", status: "Available" },
  { name: "Fire Truck 1", location: "BFP R7 Ginatilan Fire Station", status: "Available" },
  { name: "Tanod Post A", location: "San Roque Barangay Hall", status: "Available" },
  { name: "Police Station", location: "Ginatilan Municipal Police Station", status: "Available" },
  { name: "Tanod Post B", location: "San Roque Barangay Hall", status: "Off" },
];

function render(filter = "All") {
  const list = document.getElementById("teamList");
  const filtered = team.filter(t => filter === "All" || t.status === filter);
  
  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty"><h3>No units</h3><p>Nobody matches this filter.</p></div>`;
    return;
  }

  list.innerHTML = "";
  filtered.forEach(t => {
    const badgeText = t.status === "Off" ? "Off duty" : t.status;
    list.innerHTML += `<div class="card">
      <h3>${t.name}</h3>
      <p>${t.location}</p>
      <span class="badge ${t.status.toLowerCase()}">${badgeText}</span>
    </div>`;
  });
}

function filterTeam(status, btn) {
  document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  render(status);
}

function addResponder() {
  alert("Add Responder clicked!");
}

render();