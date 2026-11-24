const contactButton = document.getElementById("contact");
const logoutButton = document.getElementById("logout");

if (contactButton) {
  contactButton.addEventListener("click", function () {
    alert("Contacting admin...");
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", function () {
    if (confirm("Log out of your responder account?")) {
      localStorage.removeItem("responderPhone");
      localStorage.removeItem("responderVerified");
      localStorage.removeItem("responderApprovalStatus");
      localStorage.removeItem("responderToken");
      window.location.replace("../../Sign-In/Screens/responder-sign-in/sign-in.html");
    }
  });
}
