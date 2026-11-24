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
const statusMessage = document.getElementById("statusMessage");

function setStatus(status) {
    [step1, step2, step3].forEach((step) => step.classList.remove("completed"));
    startButton.classList.add("hidden");
    advanceStatusButton.classList.remove("hidden");
    advanceStatusButton.disabled = false;
    advanceStatusButton.textContent = "Refresh status";
    contactButton.style.display = "block";
    step1.classList.add("completed");

    if (status === "approved") {
        pageTitle.textContent = "You're approved!";
        pageDescription.textContent = "Your responder account is active and may accept emergency requests.";
        headerIcon.className = "fa-solid fa-circle-check";
        step2.classList.add("completed");
        step3.classList.add("completed");
        startButton.classList.remove("hidden");
        advanceStatusButton.classList.add("hidden");
        contactButton.style.display = "none";
        return;
    }

    if (status === "rejected") {
        pageTitle.textContent = "Application not approved";
        pageDescription.textContent = "Your registration was not approved. Contact the city emergency administration for next steps.";
        headerIcon.className = "fa-regular fa-circle-xmark";
        advanceStatusButton.textContent = "Check again";
        return;
    }

    pageTitle.textContent = "Waiting for approval";
    pageDescription.textContent = "An admin has to confirm you before your unit goes live.";
    headerIcon.className = "fa-regular fa-hourglass-half";
}

async function loadApprovalStatus() {
    if (!sessionStorage.getItem("responderAuthToken")) {
        window.location.replace("../responder-sign-in/sign-in.html");
        return;
    }

    advanceStatusButton.disabled = true;
    statusMessage.textContent = "";
    try {
        const responder = await EmergencyApi.request("/api/responder/me");
        document.getElementById("phoneNumber").textContent = responder.phone || "";
        document.getElementById("unitType").textContent = `${responder.unitType || "Responder"} unit`;
        document.getElementById("unitName").textContent = responder.unitName || "Unit name not provided";
        document.getElementById("unitLocation").textContent = responder.baseStation || "Base station not provided";
        localStorage.setItem("responderApprovalStatus", responder.approvalStatus.toLowerCase());
        setStatus(responder.approvalStatus.toLowerCase());
    } catch (error) {
        statusMessage.textContent = error.message;
        if (error.message.includes("Sign in required")) {
            sessionStorage.removeItem("responderAuthToken");
            window.location.replace("../responder-sign-in/sign-in.html");
        }
    } finally {
        advanceStatusButton.disabled = false;
    }
}

advanceStatusButton.addEventListener("click", loadApprovalStatus);

startButton.addEventListener("click", () => {
    window.location.href = "../../../Responder today (avail, profile and history/responders(avail)/to.avail.html";
});

contactButton.addEventListener("click", () => {
    statusMessage.textContent = "Contact your city emergency administration for approval questions.";
});

if (logoutButton) {
    logoutButton.addEventListener("click", async (event) => {
        event.preventDefault();
        try {
            await EmergencyApi.request("/api/responder/logout", { method: "POST" });
        } catch (error) {
            statusMessage.textContent = error.message;
            return;
        }
        sessionStorage.removeItem("responderAuthToken");
        sessionStorage.removeItem("responderChallengeId");
        localStorage.removeItem("responderVerified");
        window.location.replace("../responder-sign-in/sign-in.html");
    });
}

loadApprovalStatus();
