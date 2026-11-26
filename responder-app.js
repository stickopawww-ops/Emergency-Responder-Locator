(function () {
  function redirectToSignIn() {
    sessionStorage.removeItem("responderAuthToken");
    window.location.replace("../../Sign-In/Screens/responder-sign-in/sign-in.html");
  }

  function renderIncidents(incidents, target, historyMode) {
    target.replaceChildren();
    const items = historyMode
      ? incidents
      : incidents.filter((incident) => incident.status === "ASSIGNED");
    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      const heading = document.createElement("h2");
      heading.textContent = historyMode ? "No incident history" : "No active calls";
      const description = document.createElement("p");
      description.textContent = historyMode
        ? "Completed responder incidents will appear here."
        : "Dispatch will let you know when you are assigned.";
      empty.append(heading, description);
      target.append(empty);
      return;
    }

    items.forEach((incident) => {
      const card = document.createElement("article");
      card.className = "card";
      const title = document.createElement("h3");
      title.textContent = incident.category;
      const description = document.createElement("p");
      description.textContent = incident.description || "No details provided.";
      const status = document.createElement("span");
      status.className = `badge ${incident.status.toLowerCase()}`;
      status.textContent = incident.status;
      card.append(title, description, status);
      if (!historyMode && incident.status === "ASSIGNED") {
        const resolve = document.createElement("button");
        resolve.type = "button";
        resolve.className = "btn";
        resolve.textContent = "Mark resolved";
        resolve.addEventListener("click", async () => {
          resolve.disabled = true;
          try {
            await window.EmergencyApi.request(`/api/responder/incidents/${incident.id}/resolve`, {
              method: "PATCH"
            });
            await load();
          } catch (error) {
            window.alert(error.message);
            resolve.disabled = false;
          }
        });
        card.append(resolve);
      }
      target.append(card);
    });
  }

  async function load() {
    if (!sessionStorage.getItem("responderAuthToken")) {
      redirectToSignIn();
      return;
    }
    try {
      const [profile, incidents] = await Promise.all([
        window.EmergencyApi.request("/api/responder/me"),
        window.EmergencyApi.request("/api/responder/incidents")
      ]);
      const unit = document.querySelector(".unit");
      if (unit) unit.textContent = `${profile.unitName || profile.unitType} · ${profile.fullName}`;
      document.querySelectorAll(".head .badge").forEach((badge) => {
        badge.textContent = profile.availability.replace("_", " ");
        badge.className = `badge ${profile.availability.toLowerCase()}`;
      });

      const profileValues = {
        profileName: profile.fullName,
        profileUnit: profile.unitName || profile.unitType,
        profileStation: profile.baseStation,
        profilePhone: profile.phone,
        profileApproval: profile.approvalStatus
      };
      Object.entries(profileValues).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value || "";
      });

      const today = new Date().toDateString();
      const todayCount = incidents.filter((incident) => new Date(incident.createdAt).toDateString() === today).length;
      const stats = document.querySelectorAll(".stat b");
      if (stats[0]) stats[0].textContent = String(todayCount);
      if (stats[1]) stats[1].textContent = "—";
      if (stats[2]) stats[2].textContent = "—";

      const historyList = document.getElementById("incidentList");
      if (historyList) {
        renderIncidents(incidents, historyList, true);
      } else {
        const main = document.querySelector("main");
        const placeholders = main.querySelectorAll(".empty");
        placeholders.forEach((placeholder) => placeholder.remove());
        const container = document.getElementById("activeIncidents") || document.createElement("section");
        container.id = "activeIncidents";
        if (!container.isConnected) main.append(container);
        renderIncidents(incidents, container, false);
      }
    } catch (error) {
      window.alert(error.message);
      if (error.status === 401 || error.message === "Authentication is required."
        || error.message === "Session is invalid or expired.") {
        redirectToSignIn();
      }
    }
  }

  async function selectAvailability(status, destination) {
    try {
      await window.EmergencyApi.request("/api/responder/availability", {
        method: "PATCH",
        body: { availability: status }
      });
      window.location.href = destination;
    } catch (error) {
      window.alert(error.message);
    }
  }

  window.ResponderApp = { load, selectAvailability };
})();
