const feedback = document.querySelector(".feedback");
const mapArt = document.querySelector(".map-art");
let zoomLevel = 1;

document.querySelector(".back-btn").addEventListener("click", () => {
  window.location.href = "citizen.html";
});

document.querySelectorAll("[data-zoom]").forEach((button) => {
  button.addEventListener("click", () => {
    zoomLevel = button.dataset.zoom === "in"
      ? Math.min(1.8, zoomLevel + 0.2)
      : Math.max(1, zoomLevel - 0.2);
    mapArt.style.transform = `scale(${zoomLevel})`;
  });
});

document.querySelector(".call-btn").addEventListener("click", (event) => {
  const button = event.currentTarget;
  EmergencyApi.reportCall(button, "Power outage", `Citizen requested ${button.dataset.provider}.`, feedback);
});

document.querySelector('[data-nav="Log"]').addEventListener("click", () => {
  window.location.href = "log.html";
});
