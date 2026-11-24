(async function () {
  const token = localStorage.getItem("responderToken");
  if (!token) {
    window.location.replace("../../Sign-In/Screens/responder-sign-in/sign-in.html");
    return;
  }

  try {
    const response = await fetch("/api/responder/status", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error();
    if (data.responder.status !== "approved") {
      window.location.replace("../../Sign-In/Screens/approval-status/approval-status.html");
    }
  } catch {
    window.location.replace("../../Sign-In/Screens/responder-sign-in/sign-in.html");
  }
})();
