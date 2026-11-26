const inputs = [...document.querySelectorAll(".otp input")];
const message = document.getElementById("message");
const phoneNumber = localStorage.getItem("responderPhone");
const verificationPurpose = localStorage.getItem("responderVerificationPurpose");
const challengeId = sessionStorage.getItem("responderChallengeId");

if (!phoneNumber || !challengeId || !["signup", "password-reset"].includes(verificationPurpose)) {
    window.location.replace("../responder-sign-in/sign-in.html");
} else {
    document.getElementById("phoneNumber").textContent = `+63 ${phoneNumber}`;
    if (verificationPurpose === "password-reset") {
        document.getElementById("verificationPrompt").textContent =
            "Enter the 6-digit code sent to";
    }
}

inputs.forEach((input, index) => {
    input.addEventListener("input", () => {
        input.value = input.value.replace(/\D/g, "").slice(0, 1);
        message.textContent = "";
        if (input.value && index < inputs.length - 1) inputs[index + 1].focus();
    });

    input.addEventListener("keydown", event => {
        if (event.key === "Backspace" && !input.value && index > 0) inputs[index - 1].focus();
    });
});

document.querySelector(".otp").addEventListener("paste", (event) => {
    const pastedCode = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedCode) {
        return;
    }

    event.preventDefault();
    inputs.forEach((input, index) => {
        input.value = code[index] || "";
    });
    inputs[Math.min(code.length, inputs.length - 1)].focus();
});

document.querySelector(".back").addEventListener("click", () => {
    const destination = verificationPurpose === "password-reset"
        ? "../forgot-password/forgot-password.html"
        : "../sign-up-responder/create-account.html";
    window.location.href = destination;
});

document.querySelector(".verify").onclick = async () => {

    const code=[...inputs].map(i=>i.value).join("");

    if (code.length !== 6) {
        message.textContent = "Please enter all 6 digits.";
        inputs[[...inputs].findIndex((input) => !input.value)].focus();
        return;
    }

    try {
        if (verificationPurpose === "password-reset") {
            const result = await EmergencyApi.request("/api/auth/responders/password-reset/verify", {
                method: "POST",
                auth: false,
                body: { challengeId, code }
            });
            sessionStorage.setItem("responderResetToken", result.resetToken);
            localStorage.setItem("responderVerified", "true");
            window.location.href = "../new-password/new-password.html";
            return;
        }

        const result = await EmergencyApi.request("/api/auth/responders/verify", {
            method: "POST",
            auth: false,
            body: { challengeId, code }
        });
        sessionStorage.setItem("responderAuthToken", result.token);
        sessionStorage.removeItem("responderChallengeId");
        localStorage.setItem("responderVerified", "true");
        localStorage.setItem("responderApprovalStatus", result.responder.approvalStatus.toLowerCase());
        localStorage.removeItem("responderVerificationPurpose");
        window.location.href = "../approval-status/approval-status.html";
    } catch (error) {
        message.textContent = error.message;
    }
};
