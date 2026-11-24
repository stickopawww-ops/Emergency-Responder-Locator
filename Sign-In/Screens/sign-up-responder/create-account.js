const unitButtons = document.querySelectorAll(".units button");
const backButton = document.querySelector(".back");
const signupForm = document.getElementById("signupForm");
const mobileNumberInput = document.getElementById("mobileNumber");
const confirmPasswordInput = document.getElementById("confirmPassword");
const backendStatus = document.getElementById("backendStatus");

async function checkBackendConnection() {
    try {
        const response = await fetch("http://localhost:8080/api/message");
        if (!response.ok) {
            throw new Error(`Backend returned HTTP ${response.status}.`);
        }

        const data = await response.json();
        if (typeof data.message !== "string") {
            throw new Error("Backend returned an unexpected response.");
        }

        backendStatus.textContent =
            `Backend connected. ${data.message}`;
        backendStatus.classList.add("connected");
    } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        backendStatus.textContent =
            `Backend connection failed: ${reason}`;
        backendStatus.classList.add("error");
        console.error("Backend connection check failed:", error);
    }
}

checkBackendConnection();

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
    const activeUnit = document.querySelector(".units button.active");
    const selectedUnit = activeUnit ? activeUnit.textContent.trim() : "";
    const phone = `+63${mobileNumber}`;

    try {
        const challenge = await EmergencyApi.request("/api/auth/responders/register", {
            method: "POST",
            auth: false,
            body: {
                fullName: document.getElementById("fullName").value.trim(),
                phone,
                password,
                unitType: selectedUnit,
                unitName: document.getElementById("unitName").value.trim(),
                baseStation: document.getElementById("baseStation").value.trim()
            }
        });
        sessionStorage.setItem("responderChallengeId", challenge.challengeId);
    } catch (error) {
        signupMessage.textContent = error.message;
        return;
    }

    localStorage.setItem("responderPhone", mobileNumber);
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