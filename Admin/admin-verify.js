```javascript
// =====================================
// SELECT OTP INPUTS AND MESSAGE
// =====================================

const otpInputs = document.querySelectorAll(".otp-input");
const messageElement = document.getElementById("message");


// =====================================
// PAGE LINKS
// =====================================

const SIGNIN_PAGE = "admin-signin.html";
const DASHBOARD_PAGE = "admin.html";


// =====================================
// MESSAGE HELPERS
// =====================================

function showMessage(text, type) {

    messageElement.textContent = text;

    messageElement.className = "message " + type;

    otpInputs.forEach(input => {

        input.classList.toggle("error", type === "error");

    });

}


function clearMessage() {

    messageElement.textContent = "";

    messageElement.className = "message";

    otpInputs.forEach(input => {

        input.classList.remove("error");

    });

}


// =====================================
// GET OTP CODE
// =====================================

function getCode() {

    return Array.from(otpInputs)
        .map(input => input.value)
        .join("");

}


// =====================================
// AUTOMATIC OTP INPUT MOVEMENT
// =====================================

otpInputs.forEach((input, index) => {

    input.addEventListener("input", function () {

        input.value = input.value.replace(/[^0-9]/g, "");

        clearMessage();


        // Move to next input

        if (input.value && index < otpInputs.length - 1) {

            otpInputs[index + 1].focus();

        }


        // Automatically verify when all 6 digits are filled

        if (getCode().length === otpInputs.length) {

            verifyCode();

        }

    });


    // Backspace, arrow keys, and Enter

    input.addEventListener("keydown", function (e) {

        if (
            e.key === "Backspace" &&
            !input.value &&
            index > 0
        ) {

            otpInputs[index - 1].value = "";

            otpInputs[index - 1].focus();

        }


        if (e.key === "ArrowLeft" && index > 0) {

            otpInputs[index - 1].focus();

        }


        if (
            e.key === "ArrowRight" &&
            index < otpInputs.length - 1
        ) {

            otpInputs[index + 1].focus();

        }


        if (e.key === "Enter") {

            verifyCode();

        }

    });

});


// =====================================
// PASTE COMPLETE OTP
// =====================================

otpInputs.forEach(input => {

    input.addEventListener("paste", function (e) {

        e.preventDefault();

        const pastedData = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, otpInputs.length);

        if (!pastedData) return;


        // Clear old digits

        otpInputs.forEach(i => i.value = "");


        // Fill OTP boxes

        pastedData.split("").forEach((digit, i) => {

            otpInputs[i].value = digit;

        });


        clearMessage();


        // Focus next input

        const nextIndex = Math.min(
            pastedData.length,
            otpInputs.length - 1
        );

        otpInputs[nextIndex].focus();


        // Verify if all 6 digits are pasted

        if (pastedData.length === otpInputs.length) {

            verifyCode();

        }

    });

});


// =====================================
// VERIFY OTP
// =====================================

function verifyCode() {

    const code = getCode();


    // Check if all 6 digits are entered

    if (code.length !== otpInputs.length) {

        showMessage(
            "Please enter the complete 6-digit code.",
            "error"
        );

        return;

    }


    // TEMPORARY DEMO CODE

    const demoCode = "123456";


    // Check verification code

    if (code === demoCode) {

        showMessage(
            "Verification successful! Welcome, Admin.",
            "success"
        );


        // Redirect to dashboard

        setTimeout(function () {

            window.location.href = DASHBOARD_PAGE;

        }, 800);

    } else {

        showMessage(
            "Incorrect verification code. Please try again.",
            "error"
        );


        // Clear OTP inputs

        otpInputs.forEach(input => {

            input.value = "";

            input.classList.add("error");

        });


        otpInputs[0].focus();

    }

}


// =====================================
// BACK BUTTON
// =====================================

function goBack() {

    window.location.href = SIGNIN_PAGE;

}


// =====================================
// COUNTDOWN TIMER
// =====================================

let timeLeft = 30;

let countdown = null;

const timerElement = document.getElementById("timer");

const resendMessage = document.getElementById("resend-message");


function startCountdown() {

    clearInterval(countdown);

    timeLeft = 30;

    timerElement.textContent = "0:30";

    timerElement.style.color = "#111111";

    timerElement.style.cursor = "default";

    resendMessage.textContent = "Resend code in";

    timerElement.onclick = null;


    countdown = setInterval(function () {

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

}


// =====================================
// RESEND OTP
// =====================================

function resendCode() {

    // DEMONSTRATION ONLY
    // No real SMS is sent.

    showMessage(
        "A new verification code has been requested.",
        "success"
    );


    // Clear OTP inputs

    otpInputs.forEach(input => {

        input.value = "";

    });


    otpInputs[0].focus();

    timerElement.onclick = null;

    startCountdown();

}


// =====================================
// INITIALIZATION
// =====================================

startCountdown();

otpInputs[0].focus();
```