const currentPage = window.location.pathname.split("/").pop() || "log.html";

document.querySelectorAll(".bottom-nav a").forEach((link) => {
  const linkPage = new URL(link.href).pathname.split("/").pop();
  const isCurrentPage = linkPage === currentPage;

  link.classList.toggle("active", isCurrentPage);
  if (isCurrentPage) {
    link.setAttribute("aria-current", "page");
  } else {
    link.removeAttribute("aria-current");
  }
});
