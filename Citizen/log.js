const currentPage = window.location.pathname.split("/").pop() || "log.html";
const content = document.querySelector(".log-content");
const clientId = EmergencyApi.getClientId();

document.querySelectorAll(".bottom-nav a").forEach((link) => {
  const linkPage = new URL(link.href).pathname.split("/").pop();
  const isCurrentPage = linkPage === currentPage;
  link.classList.toggle("active", isCurrentPage);
  if (isCurrentPage) {
    link.setAttribute("aria-current", "page");
  } else {
    link.removeAttribute("aria-current");
  }
});

async function loadIncidentLog() {
  try {
    const incidents = await EmergencyApi.request(`/api/incidents/by-client/${encodeURIComponent(clientId)}`, {
      auth: false
    });
    const emptyState = content.querySelector(".empty-state");
    if (!incidents.length) return;
    if (emptyState) emptyState.remove();

    incidents.forEach((incident) => {
      const card = document.createElement("article");
      card.className = "incident-log-card";
      const heading = document.createElement("h2");
      heading.textContent = incident.category;
      const details = document.createElement("p");
      details.textContent = incident.description || "No details provided.";
      const status = document.createElement("span");
      status.textContent = incident.status.replace("_", " ");
      const created = document.createElement("time");
      created.dateTime = incident.createdAt;
      created.textContent = new Date(incident.createdAt).toLocaleString();
      card.append(heading, details, status, created);
      content.append(card);
    });
  } catch (error) {
    const message = document.createElement("p");
    message.className = "feedback";
    message.textContent = error.message;
    content.append(message);
  }
}

loadIncidentLog();
