const backButton = document.querySelector(".back-btn");

const codeInputs = document.querySelectorAll(".code-boxes input");

const verifyButton = document.querySelector(".verify-btn");

const resendButton = document.querySelector(".resend-btn");



/* BACK BUTTON */

backButton.addEventListener("click", () => {
    window.location.href = "../admin-profile/profile.html";
});





/* OTP INPUT MOVEMENT */

codeInputs.forEach((input, index)=>{


    input.addEventListener("input", ()=>{


        if(input.value.length === 1 && index < codeInputs.length - 1){

            codeInputs[index + 1].focus();

        }


    });



    input.addEventListener("keydown",(event)=>{


        if(event.key === "Backspace" && input.value === "" && index > 0){

            codeInputs[index - 1].focus();

        }


    });


});





/* VERIFY BUTTON */

verifyButton.addEventListener("click",()=>{


    let code = "";


    codeInputs.forEach(input=>{

        code += input.value;

    });



    if(code.length !== 6){


        alert("Please enter the complete verification code.");


        return;


    }



    alert("Invitation verified successfully!");

    window.location.href = "../admin-profile/profile.html";

});






/* RESEND CODE */

resendButton.addEventListener("click",()=>{


    alert("A new verification code has been sent.");



    // Backend email API will connect here later


});