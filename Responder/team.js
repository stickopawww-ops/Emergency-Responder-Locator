const team = [
  { name: "Ambulance 1", type: "Medical • Ambulance", status: "Available", icon: "🚑" },
  { name: "Fire Truck 1", type: "Fire • Fire Truck", status: "Busy", icon: "🚒" },
  { name: "Police Unit 1", type: "Police • Patrol", status: "Available", icon: "🚓" },
  { name: "Rescue Team 1", type: "Rescue • Rescue Van", status: "Off", icon: "🛟" },
];

let currentFilter = "All";
const addResponderDialog = document.getElementById("addResponderDialog");
const addResponderForm = document.getElementById("addResponderForm");

function render(filter = currentFilter) {
  currentFilter = filter;
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
  addResponderForm.reset();
  addResponderDialog.showModal();
  document.getElementById("responderName").focus();
}

document.getElementById("cancelAddResponder").addEventListener("click", () => {
  addResponderDialog.close();
});

addResponderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("responderName").value.trim();
  if (!name) return;

  team.push({
    name,
    type: "Responder",
    status: "Off",
    icon: "🛟",
  });
  render();
  addResponderDialog.close();
});

document.querySelectorAll('.bottom-nav a[href="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    alert(`${link.textContent.trim()} is not available in this demo yet.`);
  });
});
render();