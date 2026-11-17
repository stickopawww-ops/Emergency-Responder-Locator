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