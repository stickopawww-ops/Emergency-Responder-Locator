const cards = document.querySelectorAll(".card");

cards.forEach((card) => {
  card.addEventListener("click", () => {
    cards.forEach((item) => item.classList.remove("active"));
    card.classList.add("active");
  });
});

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((navItem) => navItem.classList.remove("active"));
    item.classList.add("active");
  });
});

const emergencyButton = document.querySelector(".emergency-btn");

emergencyButton.addEventListener("click", () => {
  emergencyButton.textContent = "Calling 911...";

  setTimeout(() => {
    emergencyButton.textContent = "Life-threatening? Call 911 now";
  }, 1200);
});