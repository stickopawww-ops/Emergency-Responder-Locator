let currentFilter = "All";

if (!sessionStorage.getItem("adminAuthToken")) {
  window.location.replace("admin-signin.html");
}

function matchesFilter(responder) {
  if (currentFilter === "All") return true;
  if (currentFilter === "Off") return responder.availability === "OFF_DUTY";
  return responder.availability === currentFilter.toUpperCase();
}

async function render() {
  const list = document.getElementById("teamList");
  list.replaceChildren();
  try {
    const team = await EmergencyApi.request("/api/admin/responders", { role: "admin" });
    const filtered = team.filter(matchesFilter);
    if (!filtered.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      const heading = document.createElement("h3");
      heading.textContent = "No units";
      const message = document.createElement("p");
      message.textContent = "Nobody matches this filter.";
      empty.append(heading, message);
      list.append(empty);
      return;
    }

    filtered.forEach((responder) => {
      const card = document.createElement("div");
      card.className = "card";
      const heading = document.createElement("h3");
      heading.textContent = responder.unitName || responder.fullName;
      const location = document.createElement("p");
      location.textContent = `${responder.unitType || "Responder"} · ${responder.baseStation || "No base station"}`;
      const badge = document.createElement("span");
      badge.className = `badge ${responder.availability.toLowerCase()}`;
      badge.textContent = responder.availability.replace("_", " ");
      card.append(heading, location, badge);
      list.append(card);
    });
  } catch (error) {
    list.textContent = error.message;
  }
}

function filterTeam(status, button) {
  currentFilter = status;
  document.querySelectorAll(".filter").forEach((filter) => filter.classList.remove("active"));
  button.classList.add("active");
  render();
}


function addResponder() {
  window.location.href = "add-responder/add-responder.html";
async function addResponder() {
  const fullName = window.prompt("Responder contact name:");
  if (!fullName) return;
  const unitType = window.prompt("Unit type (for example Fire, Police, Medical):");
  if (!unitType) return;
  const unitName = window.prompt("Unit name:");
  if (!unitName) return;
  const baseStation = window.prompt("Base station:");
  if (!baseStation) return;

  try {
    await EmergencyApi.request("/api/admin/responders", {
      method: "POST",
      role: "admin",
      body: { fullName, unitType, unitName, baseStation, availability: "OFF_DUTY" }
    });
    render();
  } catch (error) {
    window.alert(error.message);
  }
}

render();
