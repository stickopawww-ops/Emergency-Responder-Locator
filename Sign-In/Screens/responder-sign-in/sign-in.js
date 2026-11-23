const signinForm = document.getElementById("signinForm");
const mobileNumber = document.getElementById("mobileNumber");
const message = document.getElementById("message");

signinForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const number = mobileNumber.value.trim();

    if (!/^[0-9]{10}$/.test(number)) {
        message.style.color = "red";
        message.textContent = "Please enter a valid 10-digit mobile number.";
        return;
    }

    const previousNumber = localStorage.getItem("responderPhone");
    if (previousNumber !== number) {
        localStorage.setItem("responderApprovalStatus", "pending");
    }

    localStorage.setItem("responderPhone", number);
    localStorage.removeItem("responderVerified");
    window.location.href = "../verification/verification.html";
});

document.querySelectorAll(".footer a").forEach((link) => {
    link.addEventListener("click", function(event) {
        event.preventDefault();
        message.style.color = "#172044";
        message.textContent = `${link.textContent.trim()} information is not available in this demo yet.`;
    });
});