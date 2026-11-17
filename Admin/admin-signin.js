document.body.innerHTML = "";

document.body.style.cssText = `
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    background: #ffffff;
    display: flex;
    justify-content: center;
    min-height: 100vh;
`;

const style = document.createElement("style");

style.textContent = `
    * {
        box-sizing: border-box;
    }

    .login-container {
        width: 100%;
        max-width: 377px;
        min-height: 100vh;
        background: #f7f4ff;
        padding: 45px 41px 14px;
        border-radius: 0 0 24px 24px;
        display: flex;
        flex-direction: column;
    }

    .header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 35px;
    }

    .shield {
        font-size: 21px;
        color: #111044;
    }

    .brand {
        font-size: 12px;
        font-weight: bold;
        color: #111044;
        white-space: nowrap;
    }

    .admin-badge {
        background: #100d48;
        color: white;
        font-size: 10px;
        font-weight: bold;
        padding: 5px 15px;
        border-radius: 20px;
        margin-left: 3px;
    }

    h2 {
        color: #111044;
        font-size: 19px;
        margin: 0 0 8px;
    }

    .description {
        font-size: 13px;
        line-height: 16px;
        color: #111111;
        margin: 0 0 25px;
    }

    .form-group {
        margin-bottom: 12px;
    }

    label {
        display: block;
        font-size: 11px;
        font-weight: bold;
        color: #111044;
        margin-bottom: 7px;
    }

    input {
        width: 100%;
        height: 39px;
        border: 1px solid #111044;
        border-radius: 10px;
        background: #f8f3f8;
        padding: 0 17px;
        font-size: 12px;
        outline: none;
        color: #111111;
    }

    input:focus {
        border: 2px solid #009cff;
    }

    .password-wrapper {
        display: flex;
        gap: 5px;
    }

    .password-wrapper input {
        flex: 1;
        min-width: 0;
    }

    .show-button {
        width: 80px;
        height: 39px;
        border: 1px solid #777777;
        border-radius: 10px;
        background: #f8f3f8;
        color: #111044;
        font-size: 11px;
        font-weight: bold;
        cursor: pointer;
    }

    .sign-in-button {
        width: 100%;
        height: 47px;
        margin-top: 16px;
        background: #100d48;
        color: white;
        border: none;
        border-radius: 11px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
    }

    .sign-in-button:hover {
        background: #211c65;
    }

    .forgot-button {
        width: 100%;
        height: 39px;
        margin-top: 10px;
        background: #f8f3f8;
        color: #111044;
        border: 1px solid #777777;
        border-radius: 10px;
        font-size: 12px;
        font-weight: bold;
        cursor: pointer;
    }

    .forgot-button:hover {
        background: #ebe5f4;
    }

    .footer {
        margin-top: auto;
        padding-top: 35px;
        text-align: center;
        color: #111111;
        font-size: 12px;
        white-space: nowrap;
    }

    @media (max-width: 350px) {
        .login-container {
            padding-left: 25px;
            padding-right: 25px;
        }

        .footer {
            font-size: 10px;
        }
    }
`;

document.head.appendChild(style);

// Main container
const container = document.createElement("div");
container.className = "login-container";

// Header
const header = document.createElement("div");
header.className = "header";

const shield = document.createElement("span");
shield.className = "shield";
shield.textContent = "⬡";

const brand = document.createElement("span");
brand.className = "brand";
brand.textContent = "Cebu Emergency Help";

const badge = document.createElement("span");
badge.className = "admin-badge";
badge.textContent = "ADMIN";

header.append(shield, brand, badge);

// Title
const title = document.createElement("h2");
title.textContent = "Admin sign in";

// Description
const description = document.createElement("p");
description.className = "description";
description.textContent =
    "For dispatch staff only. Responders and citizens use the main app.";

// Email group
const emailGroup = document.createElement("div");
emailGroup.className = "form-group";

const emailLabel = document.createElement("label");
emailLabel.textContent = "Work email";

const emailInput = document.createElement("input");
emailInput.type = "email";
emailInput.value = "rosa@cebucity.gov.ph";
emailInput.id = "email";
emailInput.autocomplete = "username";

emailGroup.append(emailLabel, emailInput);

// Password group
const passwordGroup = document.createElement("div");
passwordGroup.className = "form-group";

const passwordLabel = document.createElement("label");
passwordLabel.textContent = "Password";

const passwordWrapper = document.createElement("div");
passwordWrapper.className = "password-wrapper";

const passwordInput = document.createElement("input");
passwordInput.type = "password";
passwordInput.value = "password";
passwordInput.id = "password";
passwordInput.autocomplete = "current-password";

const showButton = document.createElement("button");
showButton.className = "show-button";
showButton.textContent = "Show";
showButton.type = "button";

showButton.addEventListener("click", () => {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        showButton.textContent = "Hide";
    } else {
        passwordInput.type = "password";
        showButton.textContent = "Show";
    }
});

passwordWrapper.append(passwordInput, showButton);
passwordGroup.append(passwordLabel, passwordWrapper);

// Sign in button
const signInButton = document.createElement("button");
signInButton.className = "sign-in-button";
signInButton.textContent = "Sign in";

signInButton.addEventListener("click", () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    if (!emailInput.checkValidity()) {
        alert("Please enter a valid email address.");
        return;
    }

    alert("Please connect your authentication system to sign in.");
});

// Forgot password button
const forgotButton = document.createElement("button");
forgotButton.className = "forgot-button";
forgotButton.textContent = "Forgot password";

forgotButton.addEventListener("click", () => {
    alert("Please contact your system administrator to reset your password.");
});

// Footer
const footer = document.createElement("div");
footer.className = "footer";
footer.textContent =
    "Every sign in and action is recorded in the activity log.";

// Assemble page
container.append(
    header,
    title,
    description,
    emailGroup,
    passwordGroup,
    signInButton,
    forgotButton,
    footer
);

document.body.appendChild(container);