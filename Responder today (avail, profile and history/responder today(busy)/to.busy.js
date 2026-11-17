// Status tabs switch to the matching frame folder
document.querySelectorAll(".tab").forEach(function (tab) {
  tab.addEventListener("click", function () {
    window.location.href = tab.dataset.href;
  });
});
