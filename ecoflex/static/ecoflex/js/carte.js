/* global L */
'use strict';

// Types d'abonnements
const abonnements = {
    occasionnelle: {
        nom: "Occasionnelle",
        minutes: "Indéterminé",
        prix: "0.50$ par minute"
    },
    journalier: {
        nom: "Journalier",
        minutes: "24 heures",
        prix: "15.00$"
    },
    mensuel: {
        nom: "Mensuel",
        minutes: "30 minutes",
        prix: "Inclus dans l'abonnement mensuel"
    },
    annuel: {
        nom: "Annuel",
        minutes: "30 minutes",
        prix: "Inclus dans l'abonnement annuel"
    }
};

// Obtenir type d'abonnement choisit
function getTypeAbonnement() {
    const select = document.getElementById('typeAbonnement');
    return select ? select.value : 'occasionnelle';
}

// Contenu du popup
function creerContenuPopup(station) {
    const typeAbonnement = getTypeAbonnement();
    const abonnement = abonnements[typeAbonnement];

    const nomSecurise = station.nom.split("'").join("\\'");

    let contenu = `<b>${station.nom}</b><br>
        Type : ${station.type_vehicule}<br>
        Capacité : ${station.capacite}`;

    contenu += `<br><br><strong>Votre abonnement</strong><br>
        Type : ${abonnement.nom}<br>
        Temps disponibles : ${abonnement.minutes}<br>
        Prix : ${abonnement.prix}<br><br>
        <button onclick="ouvrirModalLocation(${station.id}, '${nomSecurise}', '${station.type_vehicule}')"
            class="btn btn-success w-100">
            Réserver maintenant
        </button>`;

    return contenu;
}

// Fonction pour initialiser carte
function initialiserCarte() {
    const map = L.map('map').setView([46.8139, -71.2080], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors & Carto'
    }).addTo(map);

    L.marker([46.8139, -71.2080])
        .addTo(map)
        .bindPopup("<b>EcoFlex Québec</b><br>Centre-ville de Québec.")
        .openPopup();

    fetch("/api/stations/")
        .then(reponse => reponse.json())
        .then(data => {
            const markers = [];

            data.forEach(station => {
                const marker = L.marker([station.latitude, station.longitude]).addTo(map);
                marker.bindPopup(creerContenuPopup(station));
                markers.push({ marker: marker, station: station });
            });

            // Mettre à jour popups selon abonnement choisit
            const choixAbonnement = document.getElementById('typeAbonnement');
            if (choixAbonnement) {
                choixAbonnement.addEventListener('change', () => {
                    markers.forEach(item => {
                        item.marker.setPopupContent(creerContenuPopup(item.station));
                    });
                });
            }

            if (window.initialiserFiltre) {
                window.initialiserFiltre(map);
            }

            if (window.sauvegarderMarqueursOriginaux) {
                window.sauvegarderMarqueursOriginaux(markers.map(m => m.marker));
            }
        })
        .catch(error => {
            console.error("Erreur lors du chargement des stations :", error);
        });
}

document.addEventListener("DOMContentLoaded", initialiserCarte);

window.getTypeAbonnement = getTypeAbonnement;
window.creerContenuPopup = creerContenuPopup;