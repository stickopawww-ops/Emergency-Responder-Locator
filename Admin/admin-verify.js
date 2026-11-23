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

otpForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const code = getCode();
    if (code.length !== otpInputs.length) {
        alert("Please enter the complete 6-digit code.");
        otpInputs.find(input => !input.value)?.focus();
        return;
    }

    if (code === "123456") {
        window.location.href = "approval.html";
        return;
    }

    alert("Incorrect verification code. Please try again.");
    otpInputs.forEach(input => {
        input.value = "";
        input.classList.add("error");
    });
    otpInputs[0].focus();
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

function resendCode() {
    otpInputs.forEach(input => {
        input.value = "";
        input.classList.remove("error");
    });
    otpInputs[0].focus();
    alert("A new demo verification code has been requested. Use 123456.");
    startCountdown();
}

window.goBack = goBack;
startCountdown();
otpInputs[0].focus();
