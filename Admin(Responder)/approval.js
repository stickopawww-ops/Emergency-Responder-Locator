function approve(btn) {
  let card = btn.closest('.card');
  card.style.display = 'none';
  alert("Approved!");
}

function reject(btn) {
  let card = btn.closest('.card');
  card.style.display = 'none';
  alert("Rejected!");
}

document.querySelectorAll('.nav a[href="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    alert(`${link.textContent.trim()} is not available in this demo yet.`);
  });
});