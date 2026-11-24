const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const showButton = document.getElementById("togglePassword");
const forgotButton = document.getElementById("forgotPassword");

if (!loginForm || !emailInput || !passwordInput || !showButton || !forgotButton) {
    throw new Error("Admin sign-in page is missing required elements.");
}

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
        alert("Email and password are required.");
        emailInput.focus();
        return;
    }
    if (!email) {
        alert("Email is required.");
        emailInput.focus();
        return;
    }
    if (!password) {
        alert("Password is required.");
        passwordInput.focus();
        return;
    }

    try {
        const response = await fetch("/api/admin/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Incorrect email or password.");
        }

        sessionStorage.setItem("adminChallengeId", data.challengeId);
        sessionStorage.setItem("adminMaskedPhone", data.maskedPhone || "");
        if (data.demoOtp) {
            sessionStorage.setItem("adminDemoOtp", data.demoOtp);
            alert(`Demo verification code: ${data.demoOtp}`);
        }
        window.location.href = "admin-verify.html";
    } catch (error) {
        alert(error.message);
        passwordInput.value = "";
        passwordInput.focus();
    }
});

forgotButton.addEventListener("click", function () {
    alert("Please contact your system administrator to reset your password.");
});
