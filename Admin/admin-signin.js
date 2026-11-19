// =====================================
// DEBUG CHECK 1: CONFIRM THIS FILE IS LOADING
// =====================================
// If you do not see this message in the Console (F12), the HTML is not
// loading this file. Check the file name and the <script src="..."> line.

console.log("admin-signin.js is loading");


const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const showButton = document.getElementById("showButton");

const forgotButton = document.getElementById("forgotButton");


// =====================================
// DEBUG CHECK 2: CONFIRM THE HTML HAS ALL THE IDS
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
// PAGE TO OPEN AFTER SUCCESSFUL SIGN IN
// =====================================
// Same folder:     "admin-verify.html"
// Separate folder: "../verify/index.html"

const VERIFY_PAGE = "admin-verify.html";


// =====================================
// SHOW AND HIDE PASSWORD
// =====================================

showButton.addEventListener("click", function() {

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

loginForm.addEventListener("submit", function(event) {

    // Prevent automatic form submission
    event.preventDefault();

    console.log("Form submitted");

    // Get user input
    const email = emailInput.value.trim();

    const password = passwordInput.value;

    // =================================
    // 2. CHECK EMPTY EMAIL
    // =================================

    if (email === "") {

        alert("Email is required.");

        emailInput.focus();

        return;

    }


    // =================================
    // 3. CHECK EMPTY PASSWORD
    // =================================

    if (password.trim() === "") {

        alert("Password is required.");

        passwordInput.focus();

        return;

    }


    // =================================
    // 4. CHECK GMAIL FORMAT
    // =================================

    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!gmailPattern.test(email)) {

        alert("Please enter a valid Gmail address.");

        emailInput.focus();

        return;

    }


    // =================================
    // 5. CHECK ADMIN CREDENTIALS
    // =================================
    // DEMO ONLY: real credentials must be checked on the server.

    const adminEmail = "admin@gmail.com";

    const adminPassword = "Admin123";


    if (
        email.toLowerCase() === adminEmail &&
        password === adminPassword
    ) {

        // Login successful: go to the verification page
        console.log("Login OK. Going to: " + VERIFY_PAGE);

        window.location.replace(VERIFY_PAGE);

    } else {

        // Incorrect credentials
        console.log("Wrong credentials");

        alert("Incorrect email or password. Please try again.");

        passwordInput.value = "";

        passwordInput.focus();

    }

});


// =====================================
// FORGOT PASSWORD
// =====================================

forgotButton.addEventListener("click", function() {

    alert(
        "Please contact your system administrator to reset your password."
    );

});