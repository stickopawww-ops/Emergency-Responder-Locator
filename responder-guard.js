(async function () {
  const token = sessionStorage.getItem("responderAuthToken");
  if (!token) {
    window.location.replace("../../Sign-In/Screens/responder-sign-in/sign-in.html");
    return;
  }

  const baseUrl = window.location.port && window.location.port !== "8080"
    ? "http://127.0.0.1:8080"
    : window.location.origin;

  try {
    const response = await fetch(`${baseUrl}/api/responder/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Responder session is invalid.");
    const responder = await response.json();
    if (responder.approvalStatus !== "APPROVED") {
      window.location.replace("../../Sign-In/Screens/approval-status/approval-status.html");
    }
  } catch {
    sessionStorage.removeItem("responderAuthToken");
    window.location.replace("../../Sign-In/Screens/responder-sign-in/sign-in.html");
  }
})();
