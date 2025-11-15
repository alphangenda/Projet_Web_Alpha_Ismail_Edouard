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

            boutonAnnuler.addEventListener("click", function(e) {
                e.preventDefault();

                if (confirm("Voulez-vous vraiment annuler la location ?")) {
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = annulerLocationURL;

                    const csrfToken = getCookie('csrftoken');
                    const csrfInput = document.createElement('input');
                    csrfInput.type = 'hidden';
                    csrfInput.name = 'csrfmiddlewaretoken';
                    csrfInput.value = csrfToken;
                    form.appendChild(csrfInput);

                    document.body.appendChild(form);
                    form.submit();
                }
            });

            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
});

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}