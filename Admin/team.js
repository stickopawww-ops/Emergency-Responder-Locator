const token = sessionStorage.getItem("adminToken");
if (!token) window.location.href = "admin-signin.html";
const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
let team = [];

async function apiRequest(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}

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
  const name = prompt("Responder name:");
  const responderType = prompt("Responder type (Ambulance, Fire, Police, or Tanod):");
  const location = prompt("Station or location:");
  if (!name || !responderType || !location) return;

  apiRequest("/api/admin/responders", {
    method: "POST",
    body: JSON.stringify({ name: name.trim(), responderType: responderType.trim(), location: location.trim() })
  }).then(loadTeam).catch(error => alert(error.message));
}

async function loadTeam() {
  try {
    const data = await apiRequest("/api/admin/responders");
    team = data.responders;
    render();
  } catch (error) {
    alert(error.message);
  }
}

loadTeam();