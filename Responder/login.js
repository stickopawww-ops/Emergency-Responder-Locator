
const signinForm = document.getElementById("signinForm");
const mobileNumber = document.getElementById("mobileNumber");
const message = document.getElementById("message");
const alternativeMethod = document.getElementById("alternativeMethod");

signinForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const number = mobileNumber.value.trim();

    if (!/^[0-9]{10}$/.test(number)) {
        message.style.color = "red";
        message.textContent = "Please enter a valid 10-digit mobile number.";
        return;
    }

    message.style.color = "#172044";
    message.textContent = "Mobile number accepted. Connect an SMS service to send your verification code.";
});

alternativeMethod.addEventListener("click", function(event) {
    event.preventDefault();

    message.style.color = "#172044";
    message.textContent = "Alternative verification methods will be available soon.";
});
