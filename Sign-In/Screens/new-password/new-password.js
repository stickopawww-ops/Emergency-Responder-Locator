const showButtons = document.querySelectorAll(".show");
const resetForm = document.getElementById("resetPasswordForm");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const resetMessage = document.getElementById("resetMessage");
const phoneNumber = localStorage.getItem("responderPhone");
const verificationPurpose = localStorage.getItem("responderVerificationPurpose");

if (
    !phoneNumber ||
    verificationPurpose !== "password-reset" ||
    localStorage.getItem("responderVerified") !== "true"
) {
    window.location.replace("../responder-sign-in/sign-in.html");
}

showButtons.forEach(button => {

    button.addEventListener("click", () => {

        const input = button.previousElementSibling;

        if(input.type === "password"){

            input.type = "text";
            button.textContent = "Hide";

        }else{

            input.type = "password";
            button.textContent = "Show";

        }

    });

});



document.querySelector(".back").addEventListener("click", cancelReset);
document.querySelector(".signin").addEventListener("click", cancelReset);

function cancelReset(event) {
    if (event) {
        event.preventDefault();
    }
    localStorage.removeItem("responderVerificationPurpose");
    localStorage.removeItem("responderVerified");
    window.location.href = "../responder-sign-in/sign-in.html";
}

resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    resetMessage.textContent = "";

    if (!/^(?=.*\d).{8,}$/.test(newPasswordInput.value)) {
        resetMessage.textContent = "Use at least 8 characters and include a number.";
        return;
    }

    if (newPasswordInput.value !== confirmPasswordInput.value) {
        resetMessage.textContent = "Passwords do not match.";
        return;
    }

    try {
        const passwordHash = await hashResponderPassword(newPasswordInput.value);
        localStorage.setItem(responderPasswordKey(phoneNumber), passwordHash);
    } catch (error) {
        resetMessage.textContent = error.message;
        return;
    }

    localStorage.removeItem("responderVerificationPurpose");
    localStorage.removeItem("responderVerified");
    localStorage.setItem("responderPasswordResetCompleted", "true");
    window.location.href = "../responder-sign-in/sign-in.html";
});