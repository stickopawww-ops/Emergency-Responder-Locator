const signinForm = document.getElementById("signinForm");
const mobileNumber = document.getElementById("mobileNumber");
const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const message = document.getElementById("message");
const forgotPassword = document.getElementById("forgotPassword");

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

signinForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const number = mobileNumber.value.trim();

    if (!/^[0-9]{10}$/.test(number)) {
        message.style.color = "red";
        message.textContent = "Please enter a valid 10-digit mobile number.";
        return;
    }

    if (password.value.length < 8) {
        message.style.color = "red";
        message.textContent = "Password must be at least 8 characters.";
        return;
    }

    const savedPassword = localStorage.getItem(responderPasswordKey(number));
    if (savedPassword) {
        try {
            if (!await verifyResponderPassword(password.value, savedPassword)) {
                message.style.color = "red";
                message.textContent = "The mobile number or password is incorrect.";
                return;
            }
        } catch (error) {
            message.style.color = "red";
            message.textContent = error.message;
            return;
        }
    }

    localStorage.setItem("responderPhone", number);
    window.location.href = "../../../Responder today (avail, profile and history/responders(avail)/to.avail.html";
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