const unitButtons = document.querySelectorAll(".units button");
const backButton = document.querySelector(".back");
const signupForm = document.getElementById("signupForm");
const mobileNumberInput = document.getElementById("mobileNumber");
const confirmPasswordInput = document.getElementById("confirmPassword");

mobileNumberInput.addEventListener("input", () => {
    mobileNumberInput.setCustomValidity("");
});

confirmPasswordInput.addEventListener("input", () => {
    confirmPasswordInput.setCustomValidity("");
});

backButton.addEventListener("click", () => {
    window.location.href = "../responder-sign-in/sign-in.html";
});

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const signupMessage = document.getElementById("signupMessage");
    signupMessage.textContent = "";

    const mobileNumber = mobileNumberInput.value.replace(/\D/g, "");
    const password = document.getElementById("createPassword").value;
    const confirmPassword = confirmPasswordInput.value;

    if (!/^\d{10}$/.test(mobileNumber)) {
        mobileNumberInput.setCustomValidity("Enter a valid 10-digit mobile number.");
        mobileNumberInput.reportValidity();
        return;
    }

    mobileNumberInput.setCustomValidity("");

    if (password !== confirmPassword) {
        confirmPasswordInput.setCustomValidity("Passwords do not match.");
        confirmPasswordInput.reportValidity();
        return;
    }

    confirmPasswordInput.setCustomValidity("");
    const selectedUnit = document.querySelector(".units button.active").textContent.trim();
    let passwordHash;

    try {
        passwordHash = await hashResponderPassword(password);
    } catch (error) {
        signupMessage.textContent = error.message;
        return;
    }

    localStorage.setItem("responderPhone", mobileNumber);
    localStorage.setItem(responderPasswordKey(mobileNumber), passwordHash);
    localStorage.setItem("responderUnitType", selectedUnit);
    localStorage.setItem("responderUnitName", document.getElementById("unitName").value.trim());
    localStorage.setItem("responderBaseStation", document.getElementById("baseStation").value.trim());
    localStorage.setItem("responderApprovalStatus", "pending");
    localStorage.removeItem("responderVerified");
    localStorage.setItem("responderVerificationPurpose", "signup");
    window.location.href = "../verification/verification.html";
});

unitButtons.forEach(button => {
    button.addEventListener("click", () => {

        unitButtons.forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");
    });
});


const showButtons = document.querySelectorAll(".show");

showButtons.forEach(button => {

    button.addEventListener("click", () => {

        const input = button.previousElementSibling;

        if(input.type === "password"){
            input.type = "text";
            button.textContent = "Hide";
        }
        else{
            input.type = "password";
            button.textContent = "Show";
        }

    });

});