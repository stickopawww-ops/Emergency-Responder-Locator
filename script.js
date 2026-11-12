const citizenCard = document.querySelector(".citizen");
const responderCard = document.querySelector(".responder");
const adminCard = document.querySelector(".admin");

const emergencyButton = document.querySelector(".emergency-btn");

function selectCard(card){

    card.style.transform = "scale(0.98)";

    setTimeout(() => {
        card.style.transform = "scale(1)";
    },150);

}

citizenCard.addEventListener("click", () => {

    selectCard(citizenCard);

    setTimeout(() => {

        window.location.href = "citizen/login.html";

    },200);

});

responderCard.addEventListener("click", () => {

    selectCard(responderCard);

    setTimeout(() => {

        window.location.href = "responder/login.html";

    },200);

});

adminCard.addEventListener("click", () => {

    selectCard(adminCard);

    setTimeout(() => {

        window.location.href = "admin/login.html";

    },200);

});

emergencyButton.addEventListener("click", () => {

    window.location.href = "tel:911";

});