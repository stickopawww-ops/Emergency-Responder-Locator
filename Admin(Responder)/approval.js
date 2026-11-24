const token = sessionStorage.getItem("adminToken");
const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

async function apiRequest(url, options = {}) {
  const response = await fetch(url, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}

async function updateApproval(id, status) {
  try {
    await apiRequest(`/api/admin/approvals/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
    await loadApprovals();
  } catch (error) {
    alert(error.message);
  }
}

function approve(btn) {
  updateApproval(btn.dataset.approvalId, "Approved");
}

function reject(btn) {
  updateApproval(btn.dataset.approvalId, "Rejected");
}

async function loadApprovals() {
  if (!token) {
    window.location.href = "../Admin/admin-signin.html";
    return;
  }
  try {
    const data = await apiRequest("/api/admin/approvals");
    const container = document.querySelector(".container");
    const pending = data.approvals.filter(item => item.status === "Pending");
    container.innerHTML = pending.length ? pending.map(item => `
      <div class="card">
        <h3>${item.name}</h3>
        <p>${item.responder_type} responder</p>
        <p>${item.phone}</p>
        <button class="btn btn-green" data-approval-id="${item.id}" onclick="approve(this)">Approve</button>
        <button class="btn btn-red" data-approval-id="${item.id}" onclick="reject(this)">Reject</button>
      </div>
    `).join("") : '<div class="card"><h3>No pending approvals</h3></div>';
  } catch (error) {
    alert(error.message);
  }
}

document.querySelectorAll('.nav a[href="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    alert(`${link.textContent.trim()} is not available in this demo yet.`);
  });

  window.approve = approve;
  window.reject = reject;
  loadApprovals();
});