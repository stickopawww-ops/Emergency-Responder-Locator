const otpInputs = document.querySelectorAll(".otp-input");

// Automatically move between OTP inputs
otpInputs.forEach((input, index) => {

    input.addEventListener("input", (e) => {
        input.value = input.value.replace(/[^0-9]/g, "");

        if (input.value && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }
    });

    // Move backward when pressing Backspace
    input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !input.value && index > 0) {
            otpInputs[index - 1].focus();
        }

        if (e.key === "ArrowLeft" && index > 0) {
            otpInputs[index - 1].focus();
        }

        if (e.key === "ArrowRight" && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }
    });

});

// Support pasting a complete OTP
otpInputs.forEach((input) => {
    input.addEventListener("paste", (e) => {
        e.preventDefault();

        const pastedData = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

        pastedData.split("").forEach((digit, index) => {
            otpInputs[index].value = digit;
        });

        const nextIndex = Math.min(pastedData.length, 5);
        otpInputs[nextIndex].focus();
    });
});

// Verify OTP
function verifyCode() {
    const code = Array.from(otpInputs)
        .map(input => input.value)
        .join("");

    if (code.length !== 6) {
        alert("Please enter the complete 6-digit code.");
        return;
    }

    alert("Verification code entered: " + code);

    // Connect your authentication API here.
}

// Back button
function goBack() {
    window.history.back();
}

// Countdown timer
let timeLeft = 30;

const timerElement = document.getElementById("timer");
const resendMessage = document.getElementById("resend-message");

const countdown = setInterval(() => {
    timeLeft--;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerElement.textContent =
        `${minutes}:${String(seconds).padStart(2, "0")}`;

    if (timeLeft <= 0) {
        clearInterval(countdown);

        timerElement.textContent = "Resend code";
        timerElement.style.color = "#009cff";
        timerElement.style.cursor = "pointer";

        resendMessage.textContent = "";

        timerElement.onclick = resendCode;
    }

}, 1000);

// Resend OTP
function resendCode() {
    alert("A new verification code has been requested.");

    timeLeft = 30;

    timerElement.style.color = "#111111";
    timerElement.style.cursor = "default";
    timerElement.textContent = "0:30";

    resendMessage.textContent = "Resend code in";

    timerElement.onclick = null;

    const newCountdown = setInterval(() => {
        timeLeft--;

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        timerElement.textContent =
            `${minutes}:${String(seconds).padStart(2, "0")}`;

        if (timeLeft <= 0) {
            clearInterval(newCountdown);

            resendMessage.textContent = "";
            timerElement.textContent = "Resend code";
            timerElement.style.color = "#009cff";
            timerElement.style.cursor = "pointer";
            timerElement.onclick = resendCode;
        }
    }, 1000);
}

// Initial focus matches the screenshot
otpInputs[4].focus();