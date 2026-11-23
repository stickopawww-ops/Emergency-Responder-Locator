const otpInputs = document.querySelectorAll(".otp-input");
<<<<<<< HEAD
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
=======
const messageElement = document.getElementById("message");


// =====================================
// PAGE LINKS
// =====================================
// Same folder:     "admin-signin.html" and "admin.html"
// Separate folder: "../signin/index.html" and "../today/index.html"

const SIGNIN_PAGE = "admin-signin.html";

const DASHBOARD_PAGE = "../Admin(Responder)/map.html";


// =====================================
// MESSAGE HELPERS (replace alert())
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

    otpInputs.forEach(input => input.classList.remove("error"));

}

function getCode() {

    return Array.from(otpInputs).map(input => input.value).join("");

}


// =====================================
// AUTOMATIC OTP INPUT MOVEMENT
// =====================================

otpInputs.forEach((input, index) => {

    input.addEventListener("input", function() {

        input.value = input.value.replace(/[^0-9]/g, "");

        clearMessage();

        if (input.value && index < otpInputs.length - 1) {

            otpInputs[index + 1].focus();

        }

        // AUTO-SUBMIT WHEN ALL 6 DIGITS ARE FILLED
        if (getCode().length === otpInputs.length) {

            verifyCode();

        }

    });


    // BACKSPACE, ARROW KEYS, AND ENTER

    input.addEventListener("keydown", function(e) {

        if (
            e.key === "Backspace" &&
            !input.value &&
            index > 0
        ) {

            otpInputs[index - 1].value = "";

>>>>>>> 7a5e791a2c4e952a9a97f9f035a94d9e31029492
            otpInputs[index - 1].focus();

        }

<<<<<<< HEAD
        if (event.key === "ArrowLeft" && index > 0) {
=======
        if (e.key === "ArrowLeft" && index > 0) {

>>>>>>> 7a5e791a2c4e952a9a97f9f035a94d9e31029492
            otpInputs[index - 1].focus();

        }

<<<<<<< HEAD
        if (event.key === "ArrowRight" && index < 5) {
=======
        if (
            e.key === "ArrowRight" &&
            index < otpInputs.length - 1
        ) {

>>>>>>> 7a5e791a2c4e952a9a97f9f035a94d9e31029492
            otpInputs[index + 1].focus();

        }

<<<<<<< HEAD
=======
        if (e.key === "Enter") {

            verifyCode();

        }

>>>>>>> 7a5e791a2c4e952a9a97f9f035a94d9e31029492
    });

    input.addEventListener("paste", (event) => {

<<<<<<< HEAD
        event.preventDefault();
=======

// =====================================
// PASTE COMPLETE OTP
// =====================================

otpInputs.forEach((input) => {

    input.addEventListener("paste", function(e) {

        e.preventDefault();
>>>>>>> 7a5e791a2c4e952a9a97f9f035a94d9e31029492

        const pasted = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, otpInputs.length);

        if (!pastedData) return;

        // CLEAR OLD DIGITS FIRST
        otpInputs.forEach(i => i.value = "");

        pastedData.split("").forEach((digit, i) => {

            otpInputs[i].value = digit;

<<<<<<< HEAD
        pasted.split("").forEach((digit, i) => {
            otpInputs[i].value = digit;
        });

        const nextEmpty = [...otpInputs].find(input => !input.value);

        if (nextEmpty) {
            nextEmpty.focus();
        } else {
            otpInputs[5].focus();
=======
        });

        clearMessage();

        const nextIndex = Math.min(pastedData.length, otpInputs.length - 1);

        otpInputs[nextIndex].focus();

        if (pastedData.length === otpInputs.length) {

            verifyCode();

>>>>>>> 7a5e791a2c4e952a9a97f9f035a94d9e31029492
        }

    });

});

<<<<<<< HEAD

// VERIFY OTP

otpForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const code = [...otpInputs]
        .map(input => input.value)
        .join("");
=======
>>>>>>> 7a5e791a2c4e952a9a97f9f035a94d9e31029492

// =====================================
// VERIFY OTP
// =====================================

function verifyCode() {

    const code = getCode();


    if (code.length !== otpInputs.length) {

        showMessage("Please enter the complete 6-digit code.", "error");

        return;

    }

<<<<<<< HEAD
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
=======

    // TEMPORARY DEMO VERIFICATION CODE
    // (real verification must happen on the server)

    const demoCode = "123456";


    if (code === demoCode) {

        showMessage("Verification successful! Welcome, Admin.", "success");

        // REDIRECT TO ADMIN DASHBOARD
        setTimeout(function() {

            window.location.href = DASHBOARD_PAGE;

        }, 800);

    } else {

        showMessage("Incorrect verification code. Please try again.", "error");

        otpInputs.forEach(input => {

            input.value = "";

            input.classList.add("error");

        });

        otpInputs[0].focus();

    }

}


// =====================================
// BACK BUTTON (GO TO SIGN IN)
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
>>>>>>> 7a5e791a2c4e952a9a97f9f035a94d9e31029492

    clearInterval(countdown);

    timeLeft = 30;

    timerElement.textContent = "0:30";
    timerElement.classList.remove("resend");

<<<<<<< HEAD
    resendLabel.textContent = "Resend code in ";

    countdown = setInterval(() => {

=======
    timerElement.style.color = "#111111";

    timerElement.style.cursor = "default";

    resendMessage.textContent = "Resend code in";


    countdown = setInterval(function() {

>>>>>>> 7a5e791a2c4e952a9a97f9f035a94d9e31029492
        timeLeft--;

        const minutes = Math.floor(timeLeft / 60);

        const seconds = timeLeft % 60;

        timerElement.textContent =
            `${minutes}:${String(seconds).padStart(2, "0")}`;


        if (timeLeft <= 0) {
<<<<<<< HEAD

            clearInterval(countdown);

            resendLabel.textContent = "Didn't receive the code? ";
            timerElement.textContent = "Resend";

            timerElement.classList.add("resend");
=======

            clearInterval(countdown);

            timerElement.textContent = "Resend code";

            timerElement.style.color = "#009cff";

            timerElement.style.cursor = "pointer";

            resendMessage.textContent = "";

            timerElement.onclick = resendCode;
>>>>>>> 7a5e791a2c4e952a9a97f9f035a94d9e31029492

        }

    }, 1000);

}


<<<<<<< HEAD
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
=======
// =====================================
// RESEND OTP
// =====================================

function resendCode() {

    // DEMONSTRATION ONLY:
    // This does not send a real SMS code.

    showMessage("A new verification code has been requested.", "success");

    otpInputs.forEach(input => input.value = "");

    otpInputs[0].focus();

    timerElement.onclick = null;

    startCountdown();

}


// =====================================
// INITIALIZATION
// =====================================

startCountdown();

otpInputs[0].focus();
>>>>>>> 7a5e791a2c4e952a9a97f9f035a94d9e31029492
