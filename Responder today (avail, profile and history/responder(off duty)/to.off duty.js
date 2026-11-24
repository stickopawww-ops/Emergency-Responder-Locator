document.querySelectorAll(".tab").forEach(function (tab) {
  tab.addEventListener("click", function () {
    ResponderApp.selectAvailability(tab.dataset.status, tab.dataset.href);
  });
});

ResponderApp.load();
