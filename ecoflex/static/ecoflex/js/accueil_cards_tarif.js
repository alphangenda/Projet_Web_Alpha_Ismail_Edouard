const cards = document.querySelectorAll(".card");

cards.forEach(card => {
    card.addEventListener("mouseenter", () => {
        cards.forEach(c => c.classList.remove("expanded"));
        card.classList.add("expanded");

        card.style.opacity = "1";
    });

    card.addEventListener("mouseleave", () => {
        cards.forEach(c => {
            c.classList.remove("expanded");
            c.style.opacity = "1";
        });
    });
});



