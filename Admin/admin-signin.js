```javascript
// =====================================
// DEBUG CHECK 1: CONFIRM THIS FILE IS LOADING
// =====================================

console.log("admin-signin.js is loading");


const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const showButton = document.getElementById("showButton");
const forgotButton = document.getElementById("forgotButton");


// =====================================
// DEBUG CHECK 2: CHECK REQUIRED HTML IDS
// =====================================

const missingIds = [];

if (!loginForm) missingIds.push("loginForm");
if (!emailInput) missingIds.push("email");
if (!passwordInput) missingIds.push("password");
if (!showButton) missingIds.push("showButton");
if (!forgotButton) missingIds.push("forgotButton");

if (missingIds.length > 0) {

    alert("The HTML is missing these IDs: " + missingIds.join(", "));

    throw new Error("Missing IDs: " + missingIds.join(", "));

}


// =====================================
// PAGE TO OPEN AFTER SUCCESSFUL LOGIN
// =====================================

const VERIFY_PAGE = "admin-verify.html";


// =====================================
// SHOW AND HIDE PASSWORD
// =====================================

showButton.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";
        showButton.textContent = "Hide";

    } else {

        passwordInput.type = "password";
        showButton.textContent = "Show";

    }

});


// =====================================
// ADMIN LOGIN VALIDATION
// =====================================

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    console.log("Form submitted");


    // Get user input

    const email = emailInput.value.trim();
    const password = passwordInput.value;


    // =====================================
    // 1. CHECK EMPTY FIELDS
    // =====================================

    if (email === "" && password.trim() === "") {

        alert("Email and password are required.");

        emailInput.focus();

        return;

    }


    // =====================================
    // 2. CHECK EMPTY EMAIL
    // =====================================

    if (email === "") {

        alert("Email is required.");

        emailInput.focus();

        return;

    }


    // =====================================
    // 3. CHECK EMPTY PASSWORD
    // =====================================

    if (password.trim() === "") {

        alert("Password is required.");

        passwordInput.focus();

        return;

    }


    // =====================================
    // 4. CHECK GMAIL FORMAT
    // =====================================

    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!gmailPattern.test(email)) {

        alert("Please enter a valid Gmail address.");

        emailInput.focus();

        return;

    }


    // =====================================
    // 5. CHECK ADMIN CREDENTIALS
    // =====================================
    // DEMO ONLY: Real authentication must
    // be checked by a secure backend.

    const adminEmail = "admin@gmail.com";
    const adminPassword = "Admin123";


    if (
        email.toLowerCase() === adminEmail &&
        password === adminPassword
    ) {

        console.log("Login OK. Going to: " + VERIFY_PAGE);

        alert("Login successful! Proceeding to verification.");

        window.location.href = VERIFY_PAGE;

    } else {

        console.log("Wrong credentials");

        alert("Incorrect email or password. Please try again.");

        passwordInput.value = "";

        passwordInput.focus();

    }

});


// =====================================
// FORGOT PASSWORD
// =====================================

forgotButton.addEventListener("click", function () {

    alert(
        "Please contact your system administrator to reset your password."
    );

});
```