const token = sessionStorage.getItem("adminToken");
if (!token) {
    window.location.href = "admin-signin.html";
}

const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
};

async function apiRequest(url, options = {}) {
    const response = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Request failed.");
    return data;
}

let incidents = [];
let responders = [];

function renderIncidents(filter = "All") {
    const container = document.querySelector(".incident-container");
    const visible = filter === "Unassigned"
        ? incidents.filter(incident => incident.status === "Unassigned")
        : incidents.filter(incident => incident.status !== "Resolved");

    if (!visible.length) {
        container.innerHTML = '<div class="incident-card"><div class="incident-details"><h3>No active incidents</h3></div></div>';
        return;
    }

    container.innerHTML = visible.map(incident => `
        <div class="incident-card">
            <div class="incident-details">
                <h3>${incident.title}</h3>
                <p class="incident-location">${incident.location}</p>
                <div class="incident-tags">
                    <span class="priority-tag">${incident.priority} Priority</span>
                    <span class="waiting-tag">${incident.status === "Unassigned" ? "Unassigned" : `Assigned to ${incident.assigned_responder}`}</span>
                </div>
            </div>
            ${incident.status === "Unassigned" ? `
                <button class="assign-button" data-id="${incident.id}">Assign</button>
            ` : ""}
        </div>
    `).join("");
}

async function loadDashboard() {
    try {
        const [incidentData, responderData] = await Promise.all([
            apiRequest("/api/admin/incidents"),
            apiRequest("/api/admin/responders")
        ]);
        incidents = incidentData.incidents;
        responders = responderData.responders;

        const active = incidents.filter(incident => incident.status !== "Resolved").length;
        const unassigned = incidents.filter(incident => incident.status === "Unassigned").length;
        const free = responders.filter(responder => responder.status === "Available").length;
        const cards = document.querySelectorAll(".stat-card h2");
        [active, unassigned, free].forEach((value, index) => {
            if (cards[index]) cards[index].textContent = value;
        });
        renderIncidents();
    } catch (error) {
        alert(error.message);
        if (/Authentication|session|Admin access/i.test(error.message)) {
            window.location.href = "admin-signin.html";
        }
    }
}

document.getElementById("allActive").addEventListener("click", function () {
    this.classList.add("active");
    document.getElementById("unassigned").classList.remove("active");
    renderIncidents("All");
});

document.getElementById("unassigned").addEventListener("click", function () {
    this.classList.add("active");
    document.getElementById("allActive").classList.remove("active");
    renderIncidents("Unassigned");
});

document.querySelector(".incident-container").addEventListener("click", async function (event) {
    const button = event.target.closest(".assign-button");
    if (!button) return;
    const available = responders.filter(responder => responder.status === "Available");
    if (!available.length) {
        alert("No available responders.");
        return;
    }
    const names = available.map((responder, index) => `${index + 1}. ${responder.name}`).join("\n");
    const choice = prompt(`Choose a responder:\n${names}`);
    const responder = available[Number(choice) - 1];
    if (!responder) return;

    try {
        await apiRequest(`/api/admin/incidents/${button.dataset.id}/assign`, {
            method: "PATCH",
            body: JSON.stringify({ responderId: responder.id })
        });
        await loadDashboard();
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById("alertAll").addEventListener("click", function () {
    alert("Alert sent to all available units.");
});

loadDashboard();
