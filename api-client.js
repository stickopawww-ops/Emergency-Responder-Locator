(function () {
  const baseUrl = window.location.port && window.location.port !== "8080"
    ? "http://127.0.0.1:8080"
    : window.location.origin;
  const tokenKeys = {
    admin: "adminAuthToken",
    responder: "responderAuthToken"
  };

  async function request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    let body = options.body;

    if (body !== undefined && !(body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(body);
    }

    const role = options.role || "responder";
    const token = options.auth === false ? null : sessionStorage.getItem(tokenKeys[role]);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    let response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        method: options.method || "GET",
        headers,
        body
      });
    } catch (error) {
      throw new Error("Cannot connect to the server. Check that the backend is running.");
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new Error(payload && payload.message ? payload.message : "The request could not be completed.");
    }
    return payload;
  }

  function getClientId() {
    let clientId = localStorage.getItem("emergencyClientId");
    if (!clientId) {
      clientId = crypto.randomUUID();
      localStorage.setItem("emergencyClientId", clientId);
    }
    return clientId;
  }

  window.EmergencyApi = {
    request,
    createIncident(category, description) {
      return request("/api/incidents", {
        method: "POST",
        auth: false,
        body: {
          clientId: getClientId(),
          category,
          description,
          priority: "NORMAL"
        }
      });
    },
    async reportCall(button, category, description, feedback) {
      button.disabled = true;
      try {
        const incident = await this.createIncident(category, description);
        feedback.textContent = `Incident #${incident.id} recorded. This does not place a phone call or notify dispatch. Call 911 directly for immediate emergencies.`;
      } catch (error) {
        feedback.textContent = error.message;
      } finally {
        feedback.hidden = false;
        button.disabled = false;
      }
    },
    getClientId,
    tokenKey(role) {
      return tokenKeys[role];
    }
  };
})();
