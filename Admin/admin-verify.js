const otpForm = document.getElementById("otpForm");
const otpInputs = Array.from(document.querySelectorAll(".otp-input"));
const timerElement = document.getElementById("timer");
const resendMessage = document.getElementById("resend-message");
const phoneDescription = document.getElementById("phoneDescription");

if (!otpForm || otpInputs.length !== 6 || !timerElement || !resendMessage) {
    throw new Error("Admin verification page is missing required elements.");
}

const maskedPhone = sessionStorage.getItem("adminMaskedPhone");
if (maskedPhone && phoneDescription) {
    phoneDescription.textContent = `Enter the 6-digit code sent to ${maskedPhone}.`;
}

function getCode() {
    return otpInputs.map(input => input.value).join("");
}

otpInputs.forEach((input, index) => {
    input.addEventListener("input", function () {
        input.value = input.value.replace(/\D/g, "").slice(0, 1);
        input.classList.remove("error");

        if (input.value && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }
    });

    input.addEventListener("keydown", function (event) {
        if (event.key === "Backspace" && !input.value && index > 0) {
            otpInputs[index - 1].value = "";
            otpInputs[index - 1].focus();
        }
        if (event.key === "ArrowLeft" && index > 0) {
            otpInputs[index - 1].focus();
        }
        if (event.key === "ArrowRight" && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }
    });

    input.addEventListener("paste", function (event) {
        event.preventDefault();
        const digits = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, otpInputs.length);

        if (!digits) return;
        otpInputs.forEach(item => item.value = "");
        digits.split("").forEach((digit, digitIndex) => {
            otpInputs[digitIndex].value = digit;
        });
        otpInputs[Math.min(digits.length, otpInputs.length) - 1].focus();
    });
});

otpForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const code = getCode();
    if (code.length !== otpInputs.length) {
        alert("Please enter the complete 6-digit code.");
        otpInputs.find(input => !input.value)?.focus();
        return;
    }

    const challengeId = sessionStorage.getItem("adminChallengeId");
    if (!challengeId) {
        alert("Your sign-in session expired. Please sign in again.");
        window.location.href = "admin-signin.html";
        return;
    }

    try {
        const data = await EmergencyApi.request("/api/admin/auth/verify", {
            method: "POST",
            auth: false,
            body: { challengeId, code }
        });

        sessionStorage.setItem("adminToken", data.token);
        sessionStorage.setItem("adminUser", JSON.stringify(data.admin));
        sessionStorage.removeItem("adminChallengeId");
        sessionStorage.removeItem("adminDemoOtp");
        window.location.href = "approval.html";
    } catch (error) {
        alert(error.message);
        otpInputs.forEach(input => {
            input.value = "";
            input.classList.add("error");
        });
        otpInputs[0].focus();
    }
});

function goBack() {
    window.location.href = "admin-signin.html";
}

let timeLeft = 30;
let countdown = null;

function startCountdown() {
    clearInterval(countdown);
    timeLeft = 30;
    timerElement.textContent = "0:30";
    timerElement.classList.remove("resend");
    timerElement.onclick = null;
    resendMessage.textContent = "Resend code in";

    countdown = setInterval(function () {
        timeLeft -= 1;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes}:${String(seconds).padStart(2, "0")}`;

        if (timeLeft <= 0) {
            clearInterval(countdown);
            timerElement.textContent = "Resend code";
            timerElement.classList.add("resend");
            resendMessage.textContent = "";
            timerElement.onclick = resendCode;
        }
    }, 1000);
}

async function resendCode() {
    otpInputs.forEach(input => {
        input.value = "";
        input.classList.remove("error");
    });
    otpInputs[0].focus();

    const challengeId = sessionStorage.getItem("adminChallengeId");
    if (!challengeId) {
        alert("Your sign-in session expired. Please sign in again.");
        window.location.href = "admin-signin.html";
        return;
    }

    try {
        const data = await EmergencyApi.request("/api/admin/auth/resend", {
            method: "POST",
            auth: false,
            body: { challengeId }
        });

        sessionStorage.setItem("adminChallengeId", data.challengeId);
        sessionStorage.setItem("adminMaskedPhone", data.maskedPhone || "");
        if (data.demoOtp) {
            sessionStorage.setItem("adminDemoOtp", data.demoOtp);
            alert(`A new demo verification code has been requested: ${data.demoOtp}`);
        } else {
            alert("A new verification code has been requested.");
        }
        startCountdown();
    } catch (error) {
        alert(error.message);
    }
}

window.goBack = goBack;
startCountdown();
otpInputs[0].focus();
