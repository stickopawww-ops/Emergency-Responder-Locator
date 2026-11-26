const allActive = document.getElementById("allActive");
const unassigned = document.getElementById("unassigned");
const incidentContainer = document.querySelector(".incident-container");
const alertAll = document.getElementById("alertAll");
const navItems = document.querySelectorAll(".nav-item");
const statValues = document.querySelectorAll(".stat-card h2");
const liveBadge = document.getElementById("liveBadge");
const approvalBadge = document.getElementById("approvalBadge");
let activeFilter = "all";

if (!sessionStorage.getItem("adminAuthToken")) {
    window.location.replace("admin-signin.html");
}

async function loadDashboard() {
    try {
        const [stats, incidents, approvals] = await Promise.all([
            EmergencyApi.request("/api/admin/dashboard", { role: "admin" }),
            EmergencyApi.request("/api/admin/incidents", { role: "admin" }),
            EmergencyApi.request("/api/admin/approvals", { role: "admin" })
        ]);
        [stats.openIncidents, stats.unassignedIncidents, stats.availableResponders]
            .forEach((value, index) => {
                if (statValues[index]) statValues[index].textContent = String(value);
            });
        updateBadge(liveBadge, stats.openIncidents);
        updateBadge(approvalBadge, approvals.length);
        renderIncidents(incidents);
    } catch (error) {
        incidentContainer.replaceChildren();
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = error.message;
        incidentContainer.append(empty);
    }
}

function updateBadge(element, value) {
    if (!element) return;
    const count = Number(value) || 0;
    element.textContent = String(count);
    element.hidden = count === 0;
}

function formatIncidentTime(createdAt) {
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return "Time unavailable";
    return date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

function formatWaitingTime(createdAt) {
    const created = new Date(createdAt).getTime();
    if (Number.isNaN(created)) return "Waiting time unavailable";
    const minutes = Math.max(0, Math.floor((Date.now() - created) / 60000));
    if (minutes < 1) return "Waiting for less than 1 min";
    return `Waiting for ${minutes} min${minutes === 1 ? "" : "s"}`;
}

function renderIncidents(incidents) {
    incidentContainer.replaceChildren();
    const activeIncidents = incidents.filter((incident) =>
        ["OPEN", "UNASSIGNED", "ASSIGNED"].includes(incident.status)
        && (activeFilter !== "unassigned" || ["OPEN", "UNASSIGNED"].includes(incident.status))
    );

    if (!activeIncidents.length) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "No active incidents.";
        incidentContainer.append(empty);
        return;
    }

    activeIncidents.forEach((incident) => {
        const card = document.createElement("article");
        card.className = "incident-card";
        if (incident.status === "ASSIGNED") card.classList.add("assigned");

        const details = document.createElement("div");
        details.className = "incident-details";
        const title = document.createElement("h3");
        title.textContent = incident.category || "Emergency incident";
        const location = document.createElement("p");
        location.className = "incident-location";
        location.textContent = `${incident.description || "No details provided"} · ${formatIncidentTime(incident.createdAt)}`;
        const tags = document.createElement("div");
        tags.className = "incident-tags";
        const priority = document.createElement("span");
        priority.className = "priority-tag";
        priority.textContent = `${String(incident.priority || "NORMAL").toUpperCase()} priority`;
        const assignment = document.createElement("span");
        assignment.className = "waiting-tag";
        assignment.textContent = incident.assignedResponderName
            ? `Assigned to ${incident.assignedResponderName}`
            : `Unassigned · ${formatWaitingTime(incident.createdAt)}`;
        tags.append(priority, assignment);
        details.append(title, location, tags);

        const button = document.createElement("button");
        button.className = "assign-button";
        const unassignedIncident = ["OPEN", "UNASSIGNED"].includes(incident.status);
        button.textContent = unassignedIncident ? "Assign" : "Assigned";
        button.disabled = !unassignedIncident;
        button.addEventListener("click", async () => {
            button.disabled = true;
            try {
                await EmergencyApi.request(`/api/admin/incidents/${incident.id}/assign`, {
                    method: "POST",
                    role: "admin",
                    body: {}
                });
                await loadDashboard();
            } catch (error) {
                button.disabled = false;
                window.alert(error.message);
            }
        });

        card.append(details, button);
        incidentContainer.append(card);
    });
}

allActive.addEventListener("click", () => {
    activeFilter = "all";
    allActive.classList.add("active");
    unassigned.classList.remove("active");
    loadDashboard();
});

unassigned.addEventListener("click", () => {
    activeFilter = "unassigned";
    unassigned.classList.add("active");
    allActive.classList.remove("active");
    loadDashboard();
});

alertAll.addEventListener("click", () => {
    window.alert("Alert delivery is not configured. No units were contacted.");
});

navItems.forEach((item) => {
    item.addEventListener("click", () => {
        const label = item.textContent.trim().split(/\s+/)[0].toLowerCase();
        const destinations = {
            approval: "approval.html",
            team: "team.html",
            live: "live.html",
            map: "../Admin(Responder)/map.html"
        };
        if (destinations[label]) {
            window.location.href = destinations[label];
        }
    });
});

loadDashboard();
