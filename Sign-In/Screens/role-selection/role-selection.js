const routes = {
    citizen: "../../../Citizen/citizen.html",
    responder: "../responder-sign-in/sign-in.html",
    admin: "../../../Responder/approval.html"
};

document.querySelectorAll(".card").forEach((card) => {
    const openScreen = () => {
        const role = ["citizen", "responder", "admin"].find((name) =>
            card.classList.contains(name)
        );

        if (role) {
            window.location.href = routes[role];
        }
    };

    card.addEventListener("click", openScreen);
    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openScreen();
        }
    });
});

document.querySelector(".emergency").addEventListener("click", () => {
    window.location.href = "tel:911";
});