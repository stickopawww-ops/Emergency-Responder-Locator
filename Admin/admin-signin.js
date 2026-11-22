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
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        alert("Email and password are required.");
        return;
    }

    window.location.href = VERIFY_PAGE;

});


// =====================================
// FORGOT PASSWORD
// =====================================

forgotButton.addEventListener("click", function() {

    alert(
        "Please contact your system administrator to reset your password."
    );

});