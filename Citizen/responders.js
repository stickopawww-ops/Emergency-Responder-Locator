const filterButtons = document.querySelectorAll(".filter-button");
const responderList = document.querySelector(".responder-list");
const feedback = document.querySelector(".feedback");

function renderResponders(responders) {
  responderList.replaceChildren();
  responders.forEach((responder) => {
    const card = document.createElement("article");
    const status = responder.availability.toLowerCase();
    card.className = "station-card responder-card";
    card.dataset.status = status;

    const icon = document.createElement("div");
    icon.className = "fire-icon responder-directory-icon";
    icon.setAttribute("aria-hidden", "true");
    const info = document.createElement("div");
    info.className = "station-info";
    const name = document.createElement("h2");
    name.textContent = responder.unitName || responder.fullName;
    const location = document.createElement("p");
    location.className = "station-location";
    location.textContent = responder.baseStation || responder.unitType;
    const row = document.createElement("div");
    row.className = "status-row";
    const availability = document.createElement("span");
    availability.className = `availability ${status}`;
    availability.textContent = status.replace("_", " ");
    const distance = document.createElement("span");
    distance.className = "distance";
    distance.textContent = responder.distanceKm == null ? "" : `${responder.distanceKm.toFixed(1)} km`;
    row.append(availability, distance);
    info.append(name, location, row);

    const button = document.createElement("button");
    button.className = "call-btn";
    button.type = "button";
    button.dataset.id = responder.id;
    button.dataset.responder = responder.unitName || responder.fullName;
    button.textContent = "Call";
    card.append(icon, info, button);
    responderList.append(card);
  });
}

async function loadResponders() {
  try {
    const responders = await EmergencyApi.request("/api/responders", { auth: false });
    renderResponders(responders);
    applyFilter(document.querySelector(".filter-button.selected")?.dataset.filter || "all");
  } catch (error) {
    feedback.textContent = error.message;
    feedback.hidden = false;
  }
}

function applyFilter(filter) {
  responderList.querySelectorAll(".responder-card").forEach((card) => {
    card.hidden = filter !== "all" && card.dataset.status !== filter;
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const selected = filterButton === button;
      filterButton.classList.toggle("selected", selected);
      filterButton.setAttribute("aria-pressed", String(selected));
    });
    applyFilter(filter);
  });
});

responderList.addEventListener("click", async (event) => {
  const button = event.target.closest(".call-btn");
  if (!button) return;
  button.disabled = true;
  try {
    const incident = await EmergencyApi.createIncident(
      "Responder request",
      `Citizen requested ${button.dataset.responder}.`
    );
    feedback.textContent = `Request recorded as incident #${incident.id}. This app does not place phone calls or notify dispatch.`;
  } catch (error) {
    feedback.textContent = error.message;
  } finally {
    feedback.hidden = false;
    button.disabled = false;
  }
});

document.querySelector('[data-nav="Log"]').addEventListener("click", () => {
  window.location.href = "log.html";
});

loadResponders();
