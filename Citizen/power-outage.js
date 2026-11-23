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
  feedback.textContent = `Calling ${event.currentTarget.dataset.provider} is not available in this preview.`;
  feedback.hidden = false;
});

document.querySelector('[data-nav="Log"]').addEventListener("click", () => {
  window.location.href = "log.html";
});
