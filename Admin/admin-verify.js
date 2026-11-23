const otpInputs = document.querySelectorAll(".otp-input");
const otpForm = document.getElementById("otpForm");

const timerElement = document.getElementById("timer");
const resendLabel = document.getElementById("resendLabel");
const phoneDescription = document.getElementById("phoneDescription");

const maskedPhone = sessionStorage.getItem("adminMaskedPhone");
if (maskedPhone) {
    phoneDescription.textContent = `Enter the 6-digit code sent to the ${maskedPhone}.`;
}

let timeLeft = 30;
let countdown;

// OTP INPUT HANDLING

otpInputs.forEach((input, index) => {

    input.addEventListener("input", () => {

        input.value = input.value.replace(/[^0-9]/g, "").slice(0, 1);

        if (input.value && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }

    });

    input.addEventListener("keydown", (event) => {

        if (event.key === "Backspace" && !input.value && index > 0) {
            otpInputs[index - 1].focus();
        }

        if (event.key === "ArrowLeft" && index > 0) {
            otpInputs[index - 1].focus();
        }

        if (event.key === "ArrowRight" && index < 5) {
            otpInputs[index + 1].focus();
        }

    });

    input.addEventListener("paste", (event) => {

        event.preventDefault();

        const pasted = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

        pasted.split("").forEach((digit, i) => {
            otpInputs[i].value = digit;
        });

        const nextEmpty = [...otpInputs].find(input => !input.value);

        if (nextEmpty) {
            nextEmpty.focus();
        } else {
            otpInputs[5].focus();
        }

    });

});


// VERIFY OTP

otpForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const code = [...otpInputs]
        .map(input => input.value)
        .join("");

    if (code.length !== 6) {
        alert("Please enter the complete 6-digit code.");
        return;
    }

    const challengeId = sessionStorage.getItem("adminChallengeId");
    if (!challengeId) {
        alert("Your sign-in session expired. Please sign in again.");
        window.location.href = "admin-signin.html";
        return;
    }

    fetch("http://localhost:8080/api/admin/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, code })
    })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || data.message || "Verification failed.");
            }
            sessionStorage.setItem("adminToken", data.token);
            sessionStorage.setItem("adminUser", JSON.stringify(data.admin));
            sessionStorage.removeItem("adminChallengeId");
            sessionStorage.removeItem("adminDemoOtp");
            window.location.href = "approval.html";
        })
        .catch(error => alert(error.message));

});


// COUNTDOWN TIMER

function startTimer() {

    clearInterval(countdown);

    timeLeft = 30;

    timerElement.textContent = "0:30";
    timerElement.classList.remove("resend");

    resendLabel.textContent = "Resend code in ";

    countdown = setInterval(() => {

        timeLeft--;

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        timerElement.textContent =
            `${minutes}:${String(seconds).padStart(2, "0")}`;

        if (timeLeft <= 0) {

            clearInterval(countdown);

            resendLabel.textContent = "Didn't receive the code? ";
            timerElement.textContent = "Resend";

            timerElement.classList.add("resend");

        }

    }, 1000);

}


// RESEND OTP

timerElement.addEventListener("click", () => {

    if (timeLeft > 0) return;

    otpInputs.forEach(input => {
        input.value = "";
    });

    otpInputs[0].focus();

    const challengeId = sessionStorage.getItem("adminChallengeId");
    if (!challengeId) return;

    fetch("http://localhost:8080/api/admin/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId })
    })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || data.message || "Resend failed.");
            sessionStorage.setItem("adminChallengeId", data.challengeId);
            if (data.demo && data.demoOtp) {
                sessionStorage.setItem("adminDemoOtp", data.demoOtp);
            }
            startTimer();
        })
        .catch(error => alert(error.message));

});


// BACK BUTTON

function goBack() {
    window.history.back();
}


// INITIALIZE

startTimer();