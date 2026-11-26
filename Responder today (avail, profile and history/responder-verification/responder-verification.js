const backButton = document.querySelector(".back-btn");

const otpInputs = document.querySelectorAll(".otp-boxes input");

const verifyButton = document.querySelector(".verify-btn");

const resendButton = document.querySelector(".resend-btn");

const declineButton = document.querySelector(".decline-btn");

const pendingInviteRaw = sessionStorage.getItem("pendingResponderInvite");
if (pendingInviteRaw) {
    const pendingInvite = JSON.parse(pendingInviteRaw);
    const responderDescription = document.querySelector(".title-section p");
    const responderType = document.querySelector(".unit-card h2");
    const organization = document.querySelector(".unit-card p");
    const phoneDescription = document.querySelector(".verification-section p");

    if (pendingInvite.name) {
        responderDescription.textContent =
            `${pendingInvite.name}, an admin added you as a responder. Confirm your number to get started.`;
    }
    if (pendingInvite.type) {
        responderType.textContent = pendingInvite.type;
    }
    if (pendingInvite.organization) {
        organization.textContent = pendingInvite.organization;
    }
    if (pendingInvite.phone) {
        phoneDescription.textContent =
            `Enter the 4-digit code we texted to ${pendingInvite.phone}.`;
    }
}

backButton.addEventListener("click", () => {
    window.location.href = "../../Sign-In/Screens/responder-sign-in/sign-in.html";
});

/* OTP MOVEMENT */

otpInputs.forEach((input, index)=>{


    input.addEventListener("input",()=>{


        if(input.value.length === 1 && index < otpInputs.length - 1){

            otpInputs[index + 1].focus();

        }


    });

    input.addEventListener("keydown",(event)=>{


        if(event.key === "Backspace" && input.value === "" && index > 0){

            otpInputs[index - 1].focus();

        }


    });


})

/* VERIFY */

verifyButton.addEventListener("click",()=>{


    let code = "";


    otpInputs.forEach(input=>{

        code += input.value;

    });

    if(code.length !== 4){

        alert("Please enter the complete verification code.");
        return;

    }

    alert("Number verified successfully.");

    sessionStorage.removeItem("pendingResponderInvite");
    window.location.href = "../responders(avail)/to.avail.html";

});

/* COUNTDOWN */

let seconds = 42;

const timer = setInterval(()=>{


    if(seconds > 0){


        seconds--;


        resendButton.textContent = 
        `Resend code in 0:${seconds < 10 ? "0" + seconds : seconds}`;


    }else{


        clearInterval(timer);


        resendButton.textContent = "Resend code";


    }



},1000);

/* RESEND */

resendButton.addEventListener("click",()=>{


    if(seconds === 0){


        alert("A new code has been sent.");

        seconds = 42;


    }


});

/* DECLINE */

declineButton.addEventListener("click",()=>{


    const confirmDecline = confirm(
        "Are you sure you want to decline this invitation?"
    );


    if(confirmDecline){


        alert("Invitation declined.");

        sessionStorage.removeItem("pendingResponderInvite");
        window.location.href = "../../Sign-In/Screens/responder-sign-in/sign-in.html";


    }


});