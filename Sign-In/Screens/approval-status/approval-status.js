const STATUS = {
    PENDING: "pending",
    REVIEWING: "reviewing",
    APPROVED: "approved"
};

const savedStatus = localStorage.getItem("responderApprovalStatus");
let currentStatus = Object.values(STATUS).includes(savedStatus) ? savedStatus : STATUS.PENDING;
const responderPhone = localStorage.getItem("responderPhone");

const pageTitle = document.getElementById("pageTitle");
const pageDescription = document.getElementById("pageDescription");
const headerIcon = document.getElementById("headerIcon");

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");

const startButton = document.getElementById("startButton");
const advanceStatusButton = document.getElementById("advanceStatusButton");
const contactButton = document.getElementById("contactButton");
const logoutButton = document.getElementById("logoutButton");
const phoneNumber = document.getElementById("phoneNumber");

if (!responderPhone || localStorage.getItem("responderVerified") !== "true") {
    window.location.replace("../responder-sign-in/sign-in.html");
} else {
    phoneNumber.textContent = `+63 ${responderPhone}`;
}

function resetSteps() {
    step1.classList.remove("completed");
    step2.classList.remove("completed");
    step3.classList.remove("completed");

    startButton.classList.add("hidden");
    advanceStatusButton.classList.remove("hidden");
    contactButton.style.display = "block";
}

function setStatus(status) {

    resetSteps();

    switch (status) {

        case STATUS.PENDING:

            pageTitle.textContent = "Waiting for approval";

            pageDescription.textContent =
                "An admin has to confirm you before your unit goes live. This keeps fake units off the map.";

            headerIcon.className = "fa-regular fa-hourglass-half";
            advanceStatusButton.textContent = "Simulate admin review";

            step1.classList.add("completed");

            break;

        case STATUS.REVIEWING:

            pageTitle.textContent = "Application under review";

            pageDescription.textContent =
                "Your request is under review. Use the demo action below to simulate approval.";

            headerIcon.className = "fa-regular fa-hourglass-half";
            advanceStatusButton.textContent = "Simulate approval";

            step1.classList.add("completed");
            step2.classList.add("completed");

            break;

        case STATUS.APPROVED:

            pageTitle.textContent = "You're approved!";

            pageDescription.textContent =
                "Your responder account is now active. You may begin accepting emergency requests.";

            headerIcon.className = "fa-solid fa-circle-check";

            step1.classList.add("completed");
            step2.classList.add("completed");
            step3.classList.add("completed");

            startButton.classList.remove("hidden");
            advanceStatusButton.classList.add("hidden");

            contactButton.style.display = "none";

            break;

    }

}

advanceStatusButton.addEventListener("click", () => {
    window.location.reload();
});

startButton.addEventListener("click", () => {
    window.location.href = "../../../Responder today (avail, profile and history/responders(avail)/to.avail.html";
});

contactButton.addEventListener("click", () => {

    alert("No administrator contact is configured in this demo.");

});

if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {

        e.preventDefault();

        localStorage.removeItem("responderPhone");
        localStorage.removeItem("responderVerified");
        localStorage.removeItem("responderApprovalStatus");
        localStorage.removeItem("responderToken");
        window.location.replace("../responder-sign-in/sign-in.html");

    });
}

advanceStatusButton.textContent = "Refresh approval status";

async function refreshFromServer() {
    const token = localStorage.getItem("responderToken");
    if (!token) return;

    try {
        const response = await fetch("/api/responder/status", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to check approval.");

        const serverStatus = data.responder.status;
        currentStatus = serverStatus === "approved"
            ? STATUS.APPROVED
            : serverStatus === "rejected"
                ? STATUS.PENDING
                : STATUS.PENDING;
        localStorage.setItem("responderApprovalStatus", currentStatus);
        setStatus(currentStatus);
    } catch (error) {
        pageDescription.textContent = error.message;
    }
}

setStatus(currentStatus);
refreshFromServer();
setInterval(refreshFromServer, 5000);