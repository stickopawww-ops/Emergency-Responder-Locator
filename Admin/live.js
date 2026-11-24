const allActive = document.getElementById("allActive");
const unassigned = document.getElementById("unassigned");
const incidentContainer = document.querySelector(".incident-container");
const alertAll = document.getElementById("alertAll");
const navItems = document.querySelectorAll(".nav-item");
const statValues = document.querySelectorAll(".stat-card h2");
let activeFilter = "all";

if (!sessionStorage.getItem("adminAuthToken")) {
    window.location.replace("admin-signin.html");
}

async function loadDashboard() {
    try {
        const [stats, incidents] = await Promise.all([
            EmergencyApi.request("/api/admin/dashboard", { role: "admin" }),
            EmergencyApi.request("/api/admin/incidents", { role: "admin" })
        ]);
        [stats.openIncidents, stats.unassignedIncidents, stats.availableResponders]
            .forEach((value, index) => {
                if (statValues[index]) statValues[index].textContent = String(value);
            });
        renderIncidents(incidents);
    } catch (error) {
        incidentContainer.textContent = error.message;
    }
}

function renderIncidents(incidents) {
    incidentContainer.replaceChildren();
    const activeIncidents = incidents.filter((incident) =>
        ["OPEN", "ASSIGNED"].includes(incident.status)
        && (activeFilter !== "unassigned" || incident.status === "OPEN")
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

        const details = document.createElement("div");
        details.className = "incident-details";
        const title = document.createElement("h3");
        title.textContent = incident.category;
        const location = document.createElement("p");
        location.className = "incident-location";
        location.textContent = `${incident.description || "No details provided"} · ${new Date(incident.createdAt).toLocaleString()}`;
        const tags = document.createElement("div");
        tags.className = "incident-tags";
        const priority = document.createElement("span");
        priority.className = "priority-tag";
        priority.textContent = `${incident.priority} priority`;
        const assignment = document.createElement("span");
        assignment.className = "waiting-tag";
        assignment.textContent = incident.assignedResponderName
            ? `Assigned to ${incident.assignedResponderName}`
            : "Unassigned";
        tags.append(priority, assignment);
        details.append(title, location, tags);

        const button = document.createElement("button");
        button.className = "assign-button";
        button.textContent = incident.status === "ASSIGNED" ? "Assigned" : "Assign";
        button.disabled = incident.status !== "OPEN";
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
