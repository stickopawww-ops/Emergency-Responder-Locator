const feedback = document.querySelector(".feedback");

document.querySelector(".back-btn").addEventListener("click", () => {
  window.location.href = "citizen.html";
});

document.querySelectorAll(".call-btn").forEach((button) => {
  button.addEventListener("click", () => {
    EmergencyApi.reportCall(button, "Police", `Citizen requested ${button.dataset.station}.`, feedback);
  });
});

document.querySelector('[data-nav="Log"]').addEventListener("click", () => {
  window.location.href = "log.html";
});
