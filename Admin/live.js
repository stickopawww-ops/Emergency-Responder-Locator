const allActive = document.getElementById("allActive");
const unassigned = document.getElementById("unassigned");
const incidentCard = document.getElementById("incidentCard");
const alertAll = document.getElementById("alertAll");
const assignButton = document.getElementById("assignButton");
const navItems = document.querySelectorAll(".nav-item");

allActive.addEventListener("click", function () {
    allActive.classList.add("active");
    unassigned.classList.remove("active");
    incidentCard.style.display = "flex";
});

unassigned.addEventListener("click", function () {
    unassigned.classList.add("active");
    allActive.classList.remove("active");
    incidentCard.style.display = "flex";
});

alertAll.addEventListener("click", function () {
    alert("Alert sent to all units!");
});

assignButton.addEventListener("click", function () {
    alert("Incident selected for assignment.");
});

navItems.forEach(function (item) {
    item.addEventListener("click", function () {
        navItems.forEach(function (nav) {
            nav.classList.remove("selected");
        });
        item.classList.add("selected");
    });
});
