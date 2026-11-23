const filterButtons = document.querySelectorAll(".filter-button");
const responderCards = document.querySelectorAll(".responder-card");
const feedback = document.querySelector(".feedback");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((filterButton) => {
      const selected = filterButton === button;
      filterButton.classList.toggle("selected", selected);
      filterButton.setAttribute("aria-pressed", String(selected));
    });

    responderCards.forEach((card) => {
      card.hidden = filter !== "all" && card.dataset.status !== filter;
    });
  });
});

document.querySelectorAll(".call-btn").forEach((button) => {
  button.addEventListener("click", () => {
    feedback.textContent = `Calling ${button.dataset.responder} is not available in this preview.`;
    feedback.hidden = false;
  });
});

document.querySelector('[data-nav="Log"]').addEventListener("click", () => {
  window.location.href = "log.html";
});