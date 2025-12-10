document.addEventListener("DOMContentLoaded", () => {
  const typeButtons = document.querySelectorAll(".type-btn");
  const blocs = document.querySelectorAll(".bloc-fonctionnement");

  typeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;

      typeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      blocs.forEach((bloc) => {
        bloc.style.display = bloc.id === targetId ? "block" : "none";
      });
    });
  });
});
