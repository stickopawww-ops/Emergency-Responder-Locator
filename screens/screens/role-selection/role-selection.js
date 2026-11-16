const cards=document.querySelectorAll(".card");

cards.forEach(card=>{

card.addEventListener("click",()=>{

if(card.classList.contains("citizen")){

window.location.href="../citizen-home/citizen-home.html";

}

if(card.classList.contains("responder")){

window.location.href="../responder-sign-in/responder-sign-in.html";

}

if(card.classList.contains("admin")){

window.location.href="../admin-sign-in/admin-sign-in.html";

}

});

});

document.querySelector(".emergency").onclick=()=>{

window.location.href="tel:911";

};