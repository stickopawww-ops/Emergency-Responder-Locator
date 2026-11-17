// Display unit details when a pin is clicked
function showUnitDetail(title, description) {
  const detailBox = document.getElementById("detailBox");
  detailBox.classList.remove("hidden");
  detailBox.innerHTML = `<b>${title}</b><br>${description}`;
}

// Get the user's real location using the browser Geolocation API
// Note: This requires user permission and an internet connection
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      alert(`Your current location:\nLatitude: ${latitude}\nLongitude: ${longitude}`);
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}