const cards = document.querySelectorAll(".card");

cards.forEach((card) => {
  card.addEventListener("click", () => {
    cards.forEach((item) => item.classList.remove("active"));
    card.classList.add("active");

    if (!card.matches("a")) {
      alert("Location details are not available in this demo yet.");
    }
  });
});

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((navItem) => navItem.classList.remove("active"));
    item.classList.add("active");

    if (item.textContent.trim() === "Responder") {
      window.location.href = "responders.html";
    } else if (item.textContent.trim() === "Log") {
      alert("The emergency log is not available in this demo yet.");
    }
  });
});

const searchInput = document.querySelector(".search-box input");
const serviceCards = document.querySelectorAll(".grid > .card");

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();

  serviceCards.forEach((card) => {
    card.style.display = card.textContent.toLowerCase().includes(query) ? "" : "none";
  });
});

document.querySelector(".mic-btn").addEventListener("click", () => {
  alert("Voice search is not available in this demo yet.");
});

const emergencyButton = document.querySelector(".emergency-btn");

document.querySelector(".back-btn").addEventListener("click", () => {
  window.location.href = "../Sign-In/Screens/role-selection/role-selection.html";
});

emergencyButton.addEventListener("click", () => {
  window.location.href = "tel:911";
});