const feedback = document.querySelector(".feedback");

document.querySelector(".back-btn").addEventListener("click", () => {
  window.location.href = "citizen.html";
});

document.querySelectorAll(".call-btn").forEach((button) => {
  button.addEventListener("click", () => {
    feedback.textContent = `Calling ${button.dataset.responder} is not available in this preview.`;
    feedback.hidden = false;
  });
});

document.querySelector('[data-nav="Log"]').addEventListener("click", () => {
  feedback.textContent = "Your emergency log is not available in this preview.";
  feedback.hidden = false;
});
