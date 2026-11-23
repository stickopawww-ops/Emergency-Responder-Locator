document.getElementById("contact").addEventListener("click", function () {
  alert("Contacting admin...");
});
document.getElementById("logout").addEventListener("click", function () {
  if (confirm("Log out of your responder account?")) {
    localStorage.removeItem("responderPhone");
    localStorage.removeItem("responderVerified");
    localStorage.removeItem("responderApprovalStatus");
    window.location.href = "../../Sign-In/Screens/responder-sign-in/sign-in.html";
  }
});
