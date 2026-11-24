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

async function loadResponderApprovals() {
  const container = document.getElementById("responderApprovals");
  const token = sessionStorage.getItem("adminToken");
  if (!container) return;

  try {
    const response = await fetch("/api/admin/responders", {
      headers: { "Authorization": `Bearer ${token || ""}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to load responder accounts.");

    container.innerHTML = "";
    data.responders.forEach(responder => {
      if (responder.status === "approved" || responder.status === "rejected") return;
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <b>Responder +63 ${responder.phone}</b>
        <p>${responder.unit} · ${responder.station}</p>
        <span class="badge">${String(responder.status).toUpperCase()}</span>
        <button class="btn btn-green" type="button">Approve</button>
        <button class="btn btn-red" type="button">Reject</button>
      `;
      card.querySelector(".btn-green").addEventListener("click", () =>
        updateResponderApproval(responder.phone, "approve", card)
      );
      card.querySelector(".btn-red").addEventListener("click", () =>
        updateResponderApproval(responder.phone, "reject", card)
      );
      container.appendChild(card);
    });

    if (!container.children.length) {
      container.innerHTML = '<div class="card"><p>No responder accounts are waiting for approval.</p></div>';
    }
  } catch (error) {
    container.innerHTML = `<div class="card"><p>${error.message}</p></div>`;
  }
}

async function updateResponderApproval(phone, action, card) {
  const token = sessionStorage.getItem("adminToken");
  try {
    const response = await fetch(`/api/admin/responders/${phone}/${action}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token || ""}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to update responder.");
    card.style.display = "none";
  } catch (error) {
    alert(error.message);
  }
}

loadResponderApprovals();