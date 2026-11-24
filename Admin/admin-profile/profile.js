const backButton = document.querySelector(".back-btn");
const inviteButton = document.querySelector("#inviteAdminBtn");
const logoutButton = document.querySelector("#logoutBtn");

const cancelButton = document.querySelector(".cancel-btn");



backButton.addEventListener("click", () => {
    window.location.href = "../live.html";
});



inviteButton.addEventListener("click", () => {

    window.location.href = "../invitation-verification/invitation-verification.html";

});



logoutButton.addEventListener("click", () => {

    const confirmLogout = confirm(
        "Are you sure you want to log out?"
    );


    if(confirmLogout){

        window.location.href = "../login/login.html";

    }

});



if(cancelButton){

    cancelButton.addEventListener("click", () => {


        const cancelInvite = confirm(
            "Cancel this invitation?"
        );


        if(cancelInvite){

            cancelButton.parentElement.parentElement.remove();

        }


    });

}