'use strict';

/* global L */

const abonnements = {
    occasionnelle: {
        nom: 'Occasionnelle',
        minutes: 'Indéterminé',
        prix: '0.50$ par minute'
    },
    journalier: {
        nom: 'Journalier',
        minutes: '24 heures',
        prix: '15.00$'
    },
    mensuel: {
        nom: 'Mensuel',
        minutes: '30 minutes',
        prix: 'Inclus dans l\'abonnement mensuel'
    },
    annuel: {
        nom: 'Annuel',
        minutes: '30 minutes',
        prix: 'Inclus dans l\'abonnement annuel'
    }
};

function getTypeAbonnement() {
    const select = document.getElementById('typeAbonnement');
    return select ? select.value : 'occasionnelle';
}

function creerContenuPopup(station) {
    const typeAbonnement = getTypeAbonnement();
    const abonnement = abonnements[typeAbonnement];

    const nomSecurise = station.nom.split('\'').join('\\\'');

    let contenu = `<b>${station.nom}</b><br>
        Type : ${station.type_vehicule}<br>
        Capacité : ${station.capacite}`;

    contenu += `<br><br><strong>Votre abonnement</strong><br>
        Type : ${abonnement.nom}<br>
        Temps disponibles : ${abonnement.minutes}<br>
        Prix : ${abonnement.prix}<br><br>`;
        if (!window.locationActive) {
            contenu += `<button onclick="ouvrirModalLocation(${station.id}, '${nomSecurise}', '${station.type_vehicule}')" class="btn btn-success w-100">Louer maintenant</button>`;
        } else {
            contenu += `<div class="alert alert-warning text-center"> Une location est déjà en cours. </div>`;
        }
    return contenu;
}

function initialiserCarte() {
    const map = L.map('map').setView([46.8139, -71.2080], 13);
    window.mapInstance = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors & Carto'
    }).addTo(map);

    L.marker([46.8139, -71.2080])
        .addTo(map)
        .bindPopup('<b>EcoFlex Québec</b><br>Centre-ville de Québec.')
        .openPopup();

    fetch('/api/stations/')
        .then(reponse => reponse.json())
        .then(data => {
            const markers = [];

            data.forEach(station => {
                const marker = L.marker([station.latitude, station.longitude]).addTo(map);
                marker.options.stationData = station;
                marker.bindPopup(creerContenuPopup(station));
                markers.push({ marker: marker, station: station });
            });

            window.marqueursActuels = markers.map(item => item.marker);


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
            console.error('Erreur lors du chargement des stations :', error);
        });
}

function mettreAJourCarte(map) {
    fetch('/api/stations/')
        .then(reponse => reponse.json())
        .then(data => {
            if (window.marqueursActuels) {
                window.marqueursActuels.forEach(m => map.removeLayer(m));
            }

            const nouveauxMarqueurs = data.map(station => {
                const marker = L.marker([station.latitude, station.longitude]).addTo(map);
                marker.bindPopup(creerContenuPopup(station));
                return marker;
            });

            window.marqueursActuels = nouveauxMarqueurs;
        })
        .catch(error => console.error('Erreur carte :', error));
}

document.addEventListener('DOMContentLoaded', initialiserCarte);

window.getTypeAbonnement = getTypeAbonnement;
window.creerContenuPopup = creerContenuPopup;
window.mettreAJourCarte = mettreAJourCarte;
