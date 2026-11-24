const signinForm = document.getElementById("signinForm");
const mobileNumber = document.getElementById("mobileNumber");
const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const message = document.getElementById("message");
const forgotPassword = document.getElementById("forgotPassword");

<<<<<<< HEAD
=======
forgotPassword.addEventListener("click", () => {
    const number = mobileNumber.value.replace(/\D/g, "");
    if (/^\d{10}$/.test(number)) {
        localStorage.setItem("passwordResetPhoneDraft", number);
    } else {
        localStorage.removeItem("passwordResetPhoneDraft");
    }
});

togglePassword.addEventListener("click", function() {
    const isHidden = password.type === "password";
    password.type = isHidden ? "text" : "password";
    togglePassword.textContent = isHidden ? "Hide" : "Show";
    togglePassword.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
});

>>>>>>> origin/main
signinForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const number = mobileNumber.value.trim();

    if (!/^[0-9]{10}$/.test(number)) {
        message.style.color = "red";
        message.textContent = "Please enter a valid 10-digit mobile number.";
        return;
    }

<<<<<<< HEAD
    try {
        const response = await fetch("/api/responder/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: number })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to send the verification code.");

        localStorage.setItem("responderPhone", number);
        localStorage.setItem("responderChallengeId", data.challengeId);
        localStorage.removeItem("responderToken");
        localStorage.removeItem("responderVerified");
        window.location.href = "../verification/verification.html";
=======
    if (password.value.length < 8) {
        message.style.color = "red";
        message.textContent = "Password must be at least 8 characters.";
        return;
    }

    try {
        const result = await EmergencyApi.request("/api/auth/responders/login", {
            method: "POST",
            auth: false,
            body: { phone: `+63${number}`, password: password.value }
        });
        sessionStorage.setItem("responderAuthToken", result.token);
        localStorage.setItem("responderPhone", number);
        localStorage.setItem("responderApprovalStatus", result.responder.approvalStatus.toLowerCase());
        localStorage.setItem("responderUnitType", result.responder.unitType || "");
        localStorage.setItem("responderUnitName", result.responder.unitName || "");
        localStorage.setItem("responderBaseStation", result.responder.baseStation || "");
        window.location.href = "../../../Responder today (avail, profile and history/responders(avail)/to.avail.html";
>>>>>>> origin/main
    } catch (error) {
        message.style.color = "red";
        message.textContent = error.message;
    }
});

if (localStorage.getItem("responderPasswordResetCompleted") === "true") {
    mobileNumber.value = localStorage.getItem("responderPhone") || "";
    message.style.color = "#172044";
    message.textContent = "Password reset. Sign in with your new password.";
    localStorage.removeItem("responderPasswordResetCompleted");
}

document.querySelectorAll(".footer a").forEach((link) => {
    link.addEventListener("click", function(event) {
        event.preventDefault();
        message.style.color = "#172044";
        message.textContent = `${link.textContent.trim()} information is not available in this demo yet.`;
    });
});