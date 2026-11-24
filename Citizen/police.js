
// BACK BUTTON
function goBack() {
  window.history.back();
}

<<<<<<< HEAD
document.querySelectorAll(".call-btn").forEach((button) => {
  button.addEventListener("click", () => {
    EmergencyApi.reportCall(button, "Police", `Citizen requested ${button.dataset.station}.`, feedback);
  });
});
=======
// NAVIGATION
function goToPage(page) {
  window.location.href = page;
}
>>>>>>> c15c58f9dfd149c3beb1cb2cc71cd0ae8bf35f38

// CALL POLICE STATION
function callPolice(name) {
  const confirmCall = confirm(
    "Do you want to call " + name + "?"
  );

  if (confirmCall) {
    alert("You selected " + name + ".");
  }
}
