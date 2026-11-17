const STATUS = {
    PENDING: "pending",
    REVIEWING: "reviewing",
    APPROVED: "approved"
};

const currentStatus = localStorage.getItem("responderApprovalStatus") || STATUS.PENDING;
const responderPhone = localStorage.getItem("responderPhone");

const pageTitle = document.getElementById("pageTitle");
const pageDescription = document.getElementById("pageDescription");
const headerIcon = document.getElementById("headerIcon");

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");

const startButton = document.getElementById("startButton");
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

            step1.classList.add("completed");

            break;

        case STATUS.REVIEWING:

            pageTitle.textContent = "Application under review";

            pageDescription.textContent =
                "Your request is now being reviewed by your administrator.";

            headerIcon.className = "fa-regular fa-hourglass-half";

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

            contactButton.style.display = "none";

            break;

    }

}

startButton.addEventListener("click", () => {
    alert("The responder dashboard is not available in this demo yet.");
});

contactButton.addEventListener("click", () => {

    alert("Contact your administrator.");

});

logoutButton.addEventListener("click", (e) => {

    e.preventDefault();

    localStorage.removeItem("responderPhone");
    localStorage.removeItem("responderVerified");
    window.location.href = "../role-selection/role-selection.html";

});

setStatus(currentStatus);