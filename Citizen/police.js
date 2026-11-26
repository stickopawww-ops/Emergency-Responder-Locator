
// BACK BUTTON
function goBack() {
  window.history.back();
}

// NAVIGATION
function goToPage(page) {
  window.location.href = page;
}

// CALL POLICE STATION
function callPolice(name) {
  const confirmCall = confirm(
    "Do you want to call " + name + "?"
  );

  if (confirmCall) {
    alert("You selected " + name + ".");
  }
}
