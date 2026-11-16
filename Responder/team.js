const team = [
  { name: "Ambulance 1", type: "Medical • Ambulance", status: "Available", icon: "🚑" },
  { name: "Fire Truck 1", type: "Fire • Fire Truck", status: "Busy", icon: "🚒" },
  { name: "Police Unit 1", type: "Police • Patrol", status: "Available", icon: "🚓" },
  { name: "Rescue Team 1", type: "Rescue • Rescue Van", status: "Off", icon: "🛟" },
];

function render(filter = "All") {
  const list = document.getElementById("teamList");
  list.innerHTML = "";
  team.filter(t => filter === "All" || t.status === filter).forEach(t => {
    list.innerHTML += `<div class="card">
      <div class="icon">${t.icon}</div>
      <div style="flex:1"><h3>${t.name}</h3><p>${t.type}</p><p>${t.status}</p></div>
      <span class="badge ${t.status.toLowerCase()}">${t.status}</span>
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