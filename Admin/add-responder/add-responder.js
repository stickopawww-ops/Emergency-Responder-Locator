const backButton = document.querySelector(".back-btn");

const inviteButton = document.querySelector(".invite-btn");

const inputs = document.querySelectorAll(
    ".input-group input, .input-group select"
);



/* BACK BUTTON */

backButton.addEventListener("click",()=>{
    window.location.href = "../team.html";
});





/* SEND INVITATION */

inviteButton.addEventListener("click",()=>{


    let completed = true;



    inputs.forEach(input=>{


        if(input.value.trim() === "" || input.value === "Select type"){

            completed = false;

        }


    });





    if(!completed){

        alert("Please complete all information.");
        return;
    }

    sessionStorage.setItem("pendingResponderInvite", JSON.stringify({
        name: inputs[0].value.trim(),
        email: inputs[1].value.trim(),
        phone: inputs[2].value.trim(),
        type: inputs[3].value,
        organization: inputs[4].value.trim()
    }));

    alert("Responder invitation sent successfully.");

    window.location.href = "../../Responder today (avail, profile and history/responder-verification/responder-verification.html";

});