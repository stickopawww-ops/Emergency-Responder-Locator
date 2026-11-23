/* =========================
   PASSWORD VISIBILITY
========================= */

const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", function () {

    const isHidden = passwordInput.type === "password";

    passwordInput.type = isHidden ? "text" : "password";

    togglePassword.textContent = isHidden ? "Hide" : "Show";

});


/* =========================
   SIGN IN FORM
========================= */

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();

    const password = passwordInput.value;

    if (!email || !password) {

        alert("Please enter your work email and password.");

        return;
    }

    if (!loginForm.checkValidity()) {

        loginForm.reportValidity();

        return;
    }

    const submitButton = loginForm.querySelector(".signin-button");
    submitButton.disabled = true;
    submitButton.textContent = "Signing in...";

    fetch("http://localhost:8080/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || data.message || "Sign in failed.");
            }
            sessionStorage.setItem("adminChallengeId", data.challengeId);
            sessionStorage.setItem("adminMaskedPhone", data.maskedPhone);
            if (data.demo && data.demoOtp) {
                sessionStorage.setItem("adminDemoOtp", data.demoOtp);
            }
            window.location.href = "admin-verify.html";
        })
        .catch(error => {
            alert(error.message);
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = "Sign in";
        });

});


/* =========================
   FORGOT PASSWORD
========================= */

const forgotPassword = document.getElementById("forgotPassword");

forgotPassword.addEventListener("click", function () {

    const email = document.getElementById("email").value.trim();

    if (!email) {

        alert("Please enter your work email first.");

        return;
    }

    // Connect your password reset functionality here.

    alert("Please contact your system administrator to reset your password.");

});