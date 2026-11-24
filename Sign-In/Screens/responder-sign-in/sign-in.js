const signinForm = document.getElementById("signinForm");
const mobileNumber = document.getElementById("mobileNumber");
const message = document.getElementById("message");

signinForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const number = mobileNumber.value.trim();

    if (!/^[0-9]{10}$/.test(number)) {
        message.style.color = "red";
        message.textContent = "Please enter a valid 10-digit mobile number.";
        return;
    }

    try {
        const response = await fetch("/api/responder/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: number })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to send the verification code.");

        localStorage.setItem("responderPhone", number);
        localStorage.setItem("responderChallengeId", data.challengeId);
        localStorage.removeItem("responderToken");
        localStorage.removeItem("responderVerified");
        window.location.href = "../verification/verification.html";
    } catch (error) {
        message.style.color = "red";
        message.textContent = error.message;
    }
});

document.querySelectorAll(".footer a").forEach((link) => {
    link.addEventListener("click", function(event) {
        event.preventDefault();
        message.style.color = "#172044";
        message.textContent = `${link.textContent.trim()} information is not available in this demo yet.`;
    });
});