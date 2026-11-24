const contactButton = document.getElementById("contact");
const logoutButton = document.getElementById("logout");

ResponderApp.load();

if (contactButton) {
  contactButton.addEventListener("click", function () {
    window.alert("Contact your city emergency administration for account support.");
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", async function () {
    if (!confirm("Log out of your responder account?")) return;
    try {
      await EmergencyApi.request("/api/responder/logout", { method: "POST" });
      sessionStorage.removeItem("responderAuthToken");
      localStorage.removeItem("responderVerified");
      localStorage.removeItem("responderApprovalStatus");
      localStorage.removeItem("responderToken");
      window.location.replace("../../Sign-In/Screens/responder-sign-in/sign-in.html");
    } catch (error) {
      window.alert(error.message);
    }
  });
}
