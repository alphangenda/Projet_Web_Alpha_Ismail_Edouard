document.addEventListener("DOMContentLoaded", function () {
    const observer = new MutationObserver(() => {
        const chronoContainer = document.getElementById("chronoContainer");

        if (chronoContainer && !document.getElementById("btnAnnuler")) {
            const boutonAnnuler = document.createElement("button");
            boutonAnnuler.id = "btnAnnuler";
            boutonAnnuler.innerText = "Annuler la location";
            boutonAnnuler.style.marginTop = "12px";
            boutonAnnuler.style.backgroundColor = "#dc3545";
            boutonAnnuler.style.color = "white";
            boutonAnnuler.style.border = "none";
            boutonAnnuler.style.borderRadius = "8px";
            boutonAnnuler.style.padding = "8px 16px";
            boutonAnnuler.style.cursor = "pointer";
            boutonAnnuler.style.fontWeight = "600";
            boutonAnnuler.style.transition = "background 0.3s";

            boutonAnnuler.onmouseover = () => boutonAnnuler.style.backgroundColor = "#c82333";
            boutonAnnuler.onmouseout = () => boutonAnnuler.style.backgroundColor = "#dc3545";

            chronoContainer.appendChild(boutonAnnuler);

            boutonAnnuler.addEventListener("click", () => {
                if (confirm("Voulez-vous vraiment annuler la location ?")) {
                    window.location.href = annulerLocationURL;
                }
            });

            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
});
