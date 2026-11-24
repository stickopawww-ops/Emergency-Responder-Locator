const inputs = document.querySelectorAll(".otp input");
const message = document.getElementById("message");
const phoneNumber = localStorage.getItem("responderPhone");

if (!phoneNumber) {
    window.location.replace("../responder-sign-in/sign-in.html");
} else {
    document.getElementById("phoneNumber").textContent = `+63 ${phoneNumber}`;
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

document.querySelector(".back").onclick=()=>{

    window.location.href="../responder-sign-in/sign-in.html";

};

document.querySelector(".verify").onclick=async ()=>{

    const code=[...inputs].map(i=>i.value).join("");

    if (code.length !== 4) {
        message.textContent = "Please enter all 4 digits.";
        inputs[[...inputs].findIndex((input) => !input.value)].focus();
        return;
    }

    const challengeId = localStorage.getItem("responderChallengeId");
    if (!challengeId) {
        message.textContent = "Verification expired. Please send a new code.";
        return;
    }

    try {
        const response = await fetch("/api/responder/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ challengeId, code })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Verification failed.");

        localStorage.setItem("responderToken", data.token);
        localStorage.setItem("responderVerified", "true");
        localStorage.setItem("responderApprovalStatus", data.responder.status);
        localStorage.removeItem("responderChallengeId");
        window.location.href="../approval-status/approval-status.html";
    } catch (error) {
        message.textContent = error.message;
    }

};