const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const showButton = document.getElementById("togglePassword");
const forgotButton = document.getElementById("forgotPassword");
const loginError = document.getElementById("loginError");

if (!loginForm || !emailInput || !passwordInput || !showButton || !forgotButton || !loginError) {
    throw new Error("Admin sign-in page is missing required elements.");
}

function showLoginError(message, invalidFields = [emailInput, passwordInput]) {
    clearLoginError();
    loginError.textContent = message;
    loginError.hidden = false;
    invalidFields.forEach(input => input.setAttribute("aria-invalid", "true"));
}

function clearLoginError() {
    loginError.hidden = true;
    loginError.textContent = "";
    emailInput.removeAttribute("aria-invalid");
    passwordInput.removeAttribute("aria-invalid");
}

emailInput.addEventListener("input", clearLoginError);
passwordInput.addEventListener("input", clearLoginError);

showButton.addEventListener("click", function () {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    showButton.textContent = isPassword ? "Hide" : "Show";
    passwordInput.focus();
});

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email && !password) {
        showLoginError("Enter your work email and password.");
        emailInput.focus();
        return;
    }
    if (!email || !emailInput.validity.valid) {
        showLoginError("Enter a valid work email address.", [emailInput]);
        emailInput.focus();
        return;
    }
    if (!password) {
        showLoginError("Enter your password.", [passwordInput]);
        passwordInput.focus();
        return;
    }

    clearLoginError();
    try {
        const challenge = await EmergencyApi.request("/api/admin/auth/login", {
            method: "POST",
            auth: false,
            body: { email, password }
        });
        sessionStorage.setItem("adminChallengeId", challenge.challengeId);
        sessionStorage.setItem("adminMaskedPhone", challenge.maskedPhone);
        window.location.href = "admin-verify.html";
    } catch (error) {
        showLoginError(error.message);
        passwordInput.value = "";
        passwordInput.focus();
    }
});

forgotButton.addEventListener("click", function () {
    alert("Please contact your system administrator to reset your password.");
});
