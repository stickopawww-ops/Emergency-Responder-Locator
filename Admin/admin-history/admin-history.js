const incidentView = document.getElementById("incidentView");
const activityView = document.getElementById("activityView");
const historyError = document.getElementById("historyError");
const searchInput = document.getElementById("searchInput");
const filters = document.getElementById("filters");
const exportButton = document.getElementById("exportBtn");
const tabButtons = [...document.querySelectorAll(".tab")];
const filterButtons = [...document.querySelectorAll(".filter")];

if (!sessionStorage.getItem("adminAuthToken")) {
  window.location.replace("../admin-signin.html");
}

let incidents = [];
let activities = [];
let currentFilter = "all";
let currentTab = "incident";

function displayStatus(status) {
  return status === "OPEN" ? "UNASSIGNED" : status;
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString();
}

function renderIncidents() {
  const query = searchInput.value.trim().toLowerCase();
  const visibleIncidents = incidents.filter((incident) => {
    const status = displayStatus(incident.status);
    const matchesStatus = currentFilter === "all" || status === currentFilter;
    const searchable = [
      incident.id,
      incident.category,
      incident.description,
      incident.assignedResponderName,
      status,
      incident.priority
    ].filter(Boolean).join(" ").toLowerCase();
    return matchesStatus && searchable.includes(query);
  });

  incidentView.replaceChildren();
  if (!visibleIncidents.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = incidents.length
      ? "No incidents match this filter."
      : "No incidents have been reported yet.";
    incidentView.append(empty);
    return;
  }

  visibleIncidents.forEach((incident) => {
    const card = document.createElement("article");
    card.className = "card";

    const heading = document.createElement("h2");
    heading.textContent = `#${incident.id} · ${incident.category}`;

    const description = document.createElement("p");
    description.className = "incident-description";
    description.textContent = incident.description || "No details provided.";

    const metadata = document.createElement("p");
    metadata.className = "incident-meta";
    metadata.textContent = `Reported ${formatDate(incident.createdAt)}`;

    const incidentStatus = displayStatus(incident.status);
    const status = document.createElement("span");
    status.className = `badge status-${incidentStatus.toLowerCase()}`;
    status.textContent = incidentStatus === "UNASSIGNED" ? "Unassigned" : incidentStatus;

    const priority = document.createElement("span");
    priority.className = `badge priority-${incident.priority.toLowerCase()}`;
    priority.textContent = `${incident.priority} priority`;

    const assignment = document.createElement("p");
    assignment.className = "incident-meta";
    assignment.textContent = incident.assignedResponderName
      ? `Assigned to ${incident.assignedResponderName}`
      : incidentStatus === "UNASSIGNED" ? "Waiting for responder assignment" : "";

    card.append(heading, description, metadata, status, priority);
    if (assignment.textContent) card.append(assignment);
    if (incident.resolvedAt) {
      const resolved = document.createElement("p");
      resolved.className = "incident-meta";
      resolved.textContent = `Resolved ${formatDate(incident.resolvedAt)}`;
      card.append(resolved);
    }
    incidentView.append(card);
  });
}

function renderActivities() {
  const query = searchInput.value.trim().toLowerCase();
  const visibleActivities = activities.filter((activity) => [
    activity.action,
    activity.entityType,
    activity.entityId,
    activity.adminName
  ].filter(Boolean).join(" ").toLowerCase().includes(query));

  activityView.replaceChildren();
  if (!visibleActivities.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = activities.length
      ? "No activity matches your search."
      : "No admin activity has been recorded yet.";
    activityView.append(empty);
    return;
  }

  visibleActivities.forEach((activity) => {
    const item = document.createElement("article");
    item.className = "activity-item";

    const title = document.createElement("h2");
    title.textContent = activity.action.replaceAll("_", " ").toLowerCase();

    const detail = document.createElement("p");
    detail.textContent = `${activity.entityType.toLowerCase()}${activity.entityId == null ? "" : ` #${activity.entityId}`} · ${activity.adminName || "Administrator"}`;

    const time = document.createElement("time");
    time.dateTime = activity.createdAt;
    time.textContent = formatDate(activity.createdAt);

    item.append(title, detail, time);
    activityView.append(item);
  });
}

function render() {
  renderIncidents();
  renderActivities();
}

function selectTab(tab) {
  currentTab = tab;
  tabButtons.forEach((button) => {
    const selected = button.dataset.tab === tab;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-selected", String(selected));
  });
  incidentView.classList.toggle("hidden", tab !== "incident");
  activityView.classList.toggle("hidden", tab !== "activity");
  filters.hidden = tab !== "incident";
  exportButton.hidden = tab !== "incident";
  render();
}

async function loadHistory() {
  historyError.hidden = true;
  try {
    [incidents, activities] = await Promise.all([
      EmergencyApi.request("/api/admin/incidents", { role: "admin" }),
      EmergencyApi.request("/api/admin/audit", { role: "admin" })
    ]);
    render();
  } catch (error) {
    if (error.status === 401) {
      sessionStorage.removeItem("adminAuthToken");
      sessionStorage.removeItem("adminToken");
      window.location.replace("../admin-signin.html");
      return;
    }
    historyError.textContent = error.message;
    historyError.hidden = false;
  }
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => selectTab(button.dataset.tab));
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((filter) => {
      filter.classList.toggle("active", filter === button);
    });
    renderIncidents();
  });
});

searchInput.addEventListener("input", render);

exportButton.addEventListener("click", () => {
  const query = searchInput.value.trim().toLowerCase();
  const rows = incidents.filter((incident) => {
    const status = displayStatus(incident.status);
    const matchesStatus = currentFilter === "all" || status === currentFilter;
    const searchable = [
      incident.id,
      incident.category,
      incident.description,
      incident.assignedResponderName,
      status,
      incident.priority
    ].filter(Boolean).join(" ").toLowerCase();
    return matchesStatus && searchable.includes(query);
  });
  const columns = ["ID", "Category", "Description", "Status", "Priority", "Responder", "Created", "Resolved"];
  const escapeCsv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [
    columns.map(escapeCsv).join(","),
    ...rows.map((incident) => [
      incident.id,
      incident.category,
      incident.description,
      displayStatus(incident.status),
      incident.priority,
      incident.assignedResponderName,
      incident.createdAt,
      incident.resolvedAt
    ].map(escapeCsv).join(","))
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "incident-history.csv";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
});

selectTab(currentTab);
loadHistory();
