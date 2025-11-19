'use strict';

/* global L */


function creerContenuPopup(station) {
    const nomSecurise = station.nom.split('\'').join('\\\'');

    let contenu = `<b>${station.nom}</b><br>
        Type : ${station.type_vehicule}<br>
        Capacité : ${station.capacite}`;

    if (window.utilisateurConnecte) {

        if (!window.locationActive) {
            contenu += `<button onclick="ouvrirModalLocation(${station.id}, '${nomSecurise}', '${station.type_vehicule}')"
                class="btn btn-success w-100 mt-2">Louer maintenant</button>`;
        } else {
            contenu += `<div class="alert alert-warning text-center mt-3">
                Une location est déjà en cours.
            </div>`;
        }

    } else {
        contenu += `<div class="alert alert-info text-center mt-3">
            Connectez-vous pour louer un véhicule.<br>
            <a href="/connexion/" class="btn btn-primary btn-sm mt-2">Se connecter</a>
        </div>`;
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

window.creerContenuPopup = creerContenuPopup;
window.mettreAJourCarte = mettreAJourCarte;
