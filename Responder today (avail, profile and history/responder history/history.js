// History: tapping a call card is reserved for the call details frame
document.querySelectorAll(".card").forEach(function (card) {
  card.style.cursor = "pointer";
  card.addEventListener("click", function () {
    card.querySelector("h3").focus && card.querySelector("h3").focus();
  });
});
