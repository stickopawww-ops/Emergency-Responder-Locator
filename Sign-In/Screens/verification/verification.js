const inputs = document.querySelectorAll(".otp input");
const message = document.getElementById("message");
const phoneNumber = localStorage.getItem("responderPhone");
const verificationPurpose = localStorage.getItem("responderVerificationPurpose");

if (!phoneNumber || !["signup", "password-reset"].includes(verificationPurpose)) {
    window.location.replace("../responder-sign-in/sign-in.html");
} else {
    document.getElementById("phoneNumber").textContent = `+63 ${phoneNumber}`;
    if (verificationPurpose === "password-reset") {
        document.getElementById("verificationPrompt").textContent =
            "Enter the demo code 1234 to reset the password for";
    }
}

inputs.forEach((input,index)=>{

    input.addEventListener("input",()=>{

        input.value=input.value.replace(/[^0-9]/g,'');
        message.textContent = "";

        if(input.value && index<inputs.length-1){
            inputs[index+1].focus();
        }

    });

    input.addEventListener("keydown",(e)=>{

        if(e.key==="Backspace" && input.value==="" && index>0){
            inputs[index-1].focus();
        }

    });

});

document.querySelector(".otp").addEventListener("paste", (event) => {
    const pastedCode = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pastedCode) {
        return;
    }

    event.preventDefault();
    [...inputs].forEach((input, index) => {
        input.value = pastedCode[index] || "";
    });
    inputs[Math.min(pastedCode.length, inputs.length - 1)].focus();
});

document.querySelector(".back").addEventListener("click", () => {
    const destination = verificationPurpose === "password-reset"
        ? "../forgot-password/forgot-password.html"
        : "../sign-up-responder/create-account.html";
    window.location.href = destination;
});

document.querySelector(".verify").onclick=()=>{

    const code=[...inputs].map(i=>i.value).join("");

    if (code.length !== 4) {
        message.textContent = "Please enter all 4 digits.";
        inputs[[...inputs].findIndex((input) => !input.value)].focus();
        return;
    }

    if (code !== "1234") {
        message.textContent = "That code is incorrect. Use the demo code 1234.";
        return;
    }

    localStorage.setItem("responderVerified", "true");
    if (verificationPurpose === "password-reset") {
        window.location.href = "../new-password/new-password.html";
    } else {
        localStorage.removeItem("responderVerificationPurpose");
        window.location.href = "../approval-status/approval-status.html";
    }

};