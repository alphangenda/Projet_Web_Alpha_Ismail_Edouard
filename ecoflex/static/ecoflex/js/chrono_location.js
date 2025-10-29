'use strict';

let tempsRestant = 30 * 60;
let intervalID = null;

function demarrerChronometre() {
    if (document.getElementById('chronoContainer')) {
        return;
    }

    const chronoContainer = document.createElement('div');
    chronoContainer.id = 'chronoContainer';
    chronoContainer.style.position = 'fixed';
    chronoContainer.style.bottom = '20px';
    chronoContainer.style.left = '20px';
    chronoContainer.style.zIndex = '1100';
    chronoContainer.style.background = 'white';
    chronoContainer.style.border = '2px solid #28a745';
    chronoContainer.style.borderRadius = '12px';
    chronoContainer.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    chronoContainer.style.padding = '16px';
    chronoContainer.style.textAlign = 'center';
    chronoContainer.style.fontFamily = 'Arial, sans-serif';
    chronoContainer.style.minWidth = '200px';

    const titre = document.createElement('div');
    titre.innerText = 'Location en cours';
    titre.style.fontSize = '14px';
    titre.style.fontWeight = 'bold';
    titre.style.color = '#28a745';
    titre.style.marginBottom = '8px';

    const chronoDisplay = document.createElement('div');
    chronoDisplay.id = 'chronoDisplay';
    chronoDisplay.style.fontSize = '32px';
    chronoDisplay.style.fontWeight = 'bold';
    chronoDisplay.style.color = '#28a745';
    chronoDisplay.innerText = '00:30:00';

    const boutonAnnuler = document.createElement('button');
    boutonAnnuler.innerText = 'Annuler la location';
    boutonAnnuler.style.marginTop = '12px';
    boutonAnnuler.style.backgroundColor = '#dc3545';
    boutonAnnuler.style.color = 'white';
    boutonAnnuler.style.border = 'none';
    boutonAnnuler.style.padding = '8px 12px';
    boutonAnnuler.style.borderRadius = '6px';
    boutonAnnuler.style.cursor = 'pointer';
    boutonAnnuler.style.fontSize = '13px';
    boutonAnnuler.style.fontWeight = 'bold';

    boutonAnnuler.addEventListener('click', annulerLocation);

    chronoContainer.appendChild(titre);
    chronoContainer.appendChild(chronoDisplay);
    document.body.appendChild(chronoContainer);

    intervalID = setInterval(() => {
        if (tempsRestant > 0) {
            tempsRestant--;
            chronoDisplay.innerText = formatageTemps(tempsRestant);

            const minutes = Math.floor(tempsRestant / 60);
            if (tempsRestant <= 0) {
                chronoDisplay.style.color = '#dc3545';
                chronoContainer.style.borderColor = '#dc3545';
            } else if (minutes < 5) {
                chronoDisplay.style.color = '#ffc107';
                chronoContainer.style.borderColor = '#ffc107';
            }
        } else {
            clearInterval(intervalID);
            chronoDisplay.innerText = 'Temps écoulé !';
            chronoDisplay.style.color = '#dc3545';
        }
    }, 1000);
}

function formatageTemps(seconds) {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

function annulerLocation() {
    if (confirm('Voulez-vous vraiment annuler la location ?')) {
        window.location.href = annulerLocationURL;
    }
}


window.demarrerChronometre = demarrerChronometre;