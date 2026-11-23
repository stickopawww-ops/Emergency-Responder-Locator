const input = document.querySelector("input");
const form = document.getElementById("forgotPasswordForm");
const message = document.getElementById("message");
const backButton = document.querySelector(".back");

backButton.addEventListener("click", () => {
    window.location.href = "../responder-sign-in/sign-in.html";
});

function formatPhoneNumber(value) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) {
        return digits;
    }
    if (digits.length <= 6) {
        return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    }
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

const draftPhone = localStorage.getItem("passwordResetPhoneDraft");
if (draftPhone) {
    input.value = formatPhoneNumber(draftPhone);
    localStorage.removeItem("passwordResetPhoneDraft");
}

input.addEventListener("input", () => {
    input.value = formatPhoneNumber(input.value);
    message.textContent = "";
});

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const phoneNumber = input.value.replace(/\D/g, "");

    if (!/^\d{10}$/.test(phoneNumber)) {
        message.textContent = "Enter a valid 10-digit mobile number.";
        return;
    }

    localStorage.setItem("responderPhone", phoneNumber);
    localStorage.setItem("responderVerificationPurpose", "password-reset");
    localStorage.removeItem("responderVerified");
    window.location.href = "../verification/verification.html";
});