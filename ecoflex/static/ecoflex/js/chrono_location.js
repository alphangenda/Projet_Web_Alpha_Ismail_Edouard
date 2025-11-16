/* global annulerLocationURL */

let tempsRestant = 30 * 60;
let intervalID = null;
const STORAGE_KEY = 'ecoflex_location_active';

function chargerEtatLocation() {
    try {
        const locationData = localStorage.getItem(STORAGE_KEY);
        if (locationData && locationData !== 'null') {
            return JSON.parse(locationData);
        }
    } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
    }
    return null;
}

function sauvegarderEtatLocation(heureDebut, tempsInitial) {
    const locationData = {
        heureDebut: heureDebut,
        tempsInitial: tempsInitial,
        active: true,
        timestamp: new Date().toISOString()
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(locationData));
        return true;
    } catch (e) {
        return false;
    }
}

function supprimerEtatLocation() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('ecoflex_current_location_id');
    } catch (e) {
        console.log('La location est toujours active');
    }
}

function calculerTempsRestant(heureDebut, tempsInitial) {
    const maintenant = Date.now();
    const tempsEcoule = Math.floor((maintenant - heureDebut) / 1000);
    const reste = tempsInitial - tempsEcoule;
    return Math.max(0, reste);
}

function demarrerChronometre(restaurer = false) {
    const ancienChrono = document.getElementById('chronoContainer');
    if (ancienChrono) ancienChrono.remove();

    let heureDebut;
    let tempsInitial = 30 * 60;

    if (restaurer) {
        const locationData = chargerEtatLocation();
        if (locationData && locationData.active) {
            heureDebut = locationData.heureDebut;
            tempsInitial = locationData.tempsInitial;
            tempsRestant = calculerTempsRestant(heureDebut, tempsInitial);

            if (tempsRestant <= 0) {
                supprimerEtatLocation();
                return;
            }
        } else {
            return;
        }
    } else {
        heureDebut = Date.now();
        tempsRestant = tempsInitial;
        sauvegarderEtatLocation(heureDebut, tempsInitial);
    }

    const chronoContainer = document.createElement('div');
    chronoContainer.id = 'chronoContainer';
    chronoContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 1100;
        background: white;
        border: 2px solid #28a745;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        padding: 16px;
        text-align: center;
        font-family: Arial, sans-serif;
        min-width: 200px;
    `;

    const titre = document.createElement('div');
    titre.innerText = 'Location en cours';
    titre.style.cssText = `
        font-size: 14px;
        font-weight: bold;
        color: #28a745;
        margin-bottom: 8px;
    `;

    const chronoDisplay = document.createElement('div');
    chronoDisplay.id = 'chronoDisplay';
    chronoDisplay.style.cssText = `
        font-size: 32px;
        font-weight: bold;
        color: #28a745;
    `;
    chronoDisplay.innerText = formatageTemps(tempsRestant);

    const boutonAnnuler = document.createElement('button');
    boutonAnnuler.innerText = 'Terminer la location';
    boutonAnnuler.style.cssText = `
        margin-top: 12px;
        background-color: #dc3545;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: bold;
    `;
    boutonAnnuler.addEventListener('click', terminerLocation);

    const boutonProlonger = document.createElement('button');
    boutonProlonger.innerText = 'Prolonger (+15 min)';
    boutonProlonger.style.cssText = `
        margin-top: 8px;
        background-color: #ffc107;
        color: #000;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: bold;
        margin-left: 8px;
    `;
    boutonProlonger.addEventListener('click', prolongerLocation);

    chronoContainer.appendChild(titre);
    chronoContainer.appendChild(chronoDisplay);
    chronoContainer.appendChild(boutonAnnuler);
    chronoContainer.appendChild(boutonProlonger);
    document.body.appendChild(chronoContainer);

    if (intervalID) {
        clearInterval(intervalID);
    }

    intervalID = setInterval(() => {
        if (tempsRestant > 0) {
            tempsRestant--;
            chronoDisplay.innerText = formatageTemps(tempsRestant);

            const minutes = Math.floor(tempsRestant / 60);
            if (tempsRestant <= 0) {
                chronoDisplay.style.color = '#dc3545';
                chronoContainer.style.borderColor = '#dc3545';
                titre.innerText = 'Temps écoulé!';
                clearInterval(intervalID);
                intervalID = null;
                supprimerEtatLocation();
            } else if (minutes < 5) {
                chronoDisplay.style.color = '#ffc107';
                chronoContainer.style.borderColor = '#ffc107';
            }
        }
    }, 1000);
}

function formatageTemps(seconds) {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

function terminerLocation() {
    if (confirm('Voulez-vous vraiment terminer la location ?')) {
        if (intervalID) {
            clearInterval(intervalID);
            intervalID = null;
        }

        const chronoContainer = document.getElementById('chronoContainer');
        if (chronoContainer) {
            chronoContainer.remove();
        }

        const locationId = localStorage.getItem('ecoflex_current_location_id');
        supprimerEtatLocation();

        if (typeof annulerLocationURL !== 'undefined') {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = annulerLocationURL;

            const csrfToken = getCookie('csrftoken');
            if (csrfToken) {
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = 'csrfmiddlewaretoken';
                csrfInput.value = csrfToken;
                form.appendChild(csrfInput);
            }

            if (locationId) {
                const idInput = document.createElement('input');
                idInput.type = 'hidden';
                idInput.name = 'location_id';
                idInput.value = locationId;
                form.appendChild(idInput);
            }

            document.body.appendChild(form);
            form.submit();
        }
    }
}

function prolongerLocation() {
    if (confirm('Prolonger la location de 15 minutes ? (Des frais supplémentaires peuvent s\'appliquer)')) {
        const extensionTemps = 15 * 60;
        tempsRestant += extensionTemps;

        const locationData = chargerEtatLocation();
        if (locationData) {
            locationData.tempsInitial += extensionTemps;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(locationData));
        }

        const chronoDisplay = document.getElementById('chronoDisplay');
        const chronoContainer = document.getElementById('chronoContainer');
        const titre = chronoContainer.querySelector('div:first-child');

        if (chronoDisplay) {
            chronoDisplay.innerText = formatageTemps(tempsRestant);
            chronoDisplay.style.color = '#28a745';
        }

        if (chronoContainer) {
            chronoContainer.style.borderColor = '#28a745';
        }

        if (titre) {
            titre.innerText = 'Location en cours';
        }

        alert('Location prolongée de 15 minutes!');
    }
}

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

function initialiserChronometre() {
    const locationData = chargerEtatLocation();

    if (locationData && locationData.active) {
        demarrerChronometre(true);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiserChronometre);
} else {
    initialiserChronometre();
}

window.demarrerChronometre = demarrerChronometre;
window.terminerLocation = terminerLocation;
window.prolongerLocation = prolongerLocation;
window.supprimerEtatLocation = supprimerEtatLocation;
window.sauvegarderEtatLocation = sauvegarderEtatLocation;
window.chargerEtatLocation = chargerEtatLocation;