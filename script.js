const menuBtn = document.getElementById("menuBtn");
const mainNav = document.getElementById("mainNav");
const contactForm = document.getElementById("contactForm");
const formMsg = document.getElementById("formMsg");

if (menuBtn && mainNav) {
  menuBtn.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });
}

if (contactForm && formMsg) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formMsg.textContent = "¡Gracias! Recibimos tu consulta y te contactaremos pronto.";
    contactForm.reset();
  });
}
