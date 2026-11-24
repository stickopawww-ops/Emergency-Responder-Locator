const approvalList = document.getElementById("approvalList");

if (!sessionStorage.getItem("adminAuthToken")) {
    window.location.replace("admin-signin.html");
}

async function loadApprovals() {
    try {
        const responders = await EmergencyApi.request("/api/admin/approvals", { role: "admin" });
        approvalList.replaceChildren();
        if (!responders.length) {
            const empty = document.createElement("p");
            empty.className = "empty";
            empty.textContent = "No responder applications are awaiting approval.";
            approvalList.append(empty);
            return;
        }

        responders.forEach((responder) => {
            const card = document.createElement("div");
            card.className = "card";
            const heading = document.createElement("b");
            heading.textContent = `${responder.unitType} - ${responder.unitName}`;
            const details = document.createElement("p");
            details.textContent = `${responder.fullName} · ${responder.baseStation}`;
            const status = document.createElement("span");
            status.className = "badge";
            status.textContent = "PENDING";
            const approveButton = document.createElement("button");
            approveButton.className = "btn btn-green";
            approveButton.textContent = "Approve";
            approveButton.addEventListener("click", () => updateApproval(responder.id, "APPROVED", card));
            const rejectButton = document.createElement("button");
            rejectButton.className = "btn btn-red";
            rejectButton.textContent = "Reject";
            rejectButton.addEventListener("click", () => updateApproval(responder.id, "REJECTED", card));
            card.append(heading, details, status, approveButton, rejectButton);
            approvalList.append(card);
        });
    } catch (error) {
        approvalList.textContent = error.message;
    }
}

async function updateApproval(id, status, card) {
    try {
        await EmergencyApi.request(`/api/admin/approvals/${id}`, {
            method: "PATCH",
            role: "admin",
            body: { status }
        });
        card.remove();
        if (!approvalList.children.length) {
            const empty = document.createElement("p");
            empty.className = "empty";
            empty.textContent = "No responder applications are awaiting approval.";
            approvalList.append(empty);
        }
    } catch (error) {
        window.alert(error.message);
    }
}

loadApprovals();
