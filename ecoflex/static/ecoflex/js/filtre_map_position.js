/* global L */
'use strict';

const abonnementsFiltre = {
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

let cartePrincipale;
let toutesLesStations = [];
let marqueurs = [];
let marqueursOriginaux = [];
let marqueurUtilisateur = null;
let positionUtilisateur = null;

function calculerDistance(lat1, lon1, lat2, lon2) {
    let R = 6371;
    let dLat = (lat2 - lat1) * Math.PI / 180;
    let dLon = (lon2 - lon1) * Math.PI / 180;
    let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function geocoderAdresse(adresse, callback) {
    let url = 'https://nominatim.openstreetmap.org/search?format=json&q=' +
              encodeURIComponent(adresse + ', Québec, Canada');

    fetch(url)
        .then(function(reponse) {
            return reponse.json();
        })
        .then(function(donnees) {
            if (donnees && donnees.length > 0) {
                callback({
                    lat: parseFloat(donnees[0].lat),
                    lon: parseFloat(donnees[0].lon)
                });
            } else {
                alert('Adresse introuvable. Veuillez réessayer.');
            }
        })
        .catch(function(erreur) {
            console.error('Erreur de géocodage:', erreur);
            alert('Erreur lors de la recherche de l\'adresse.');
        });
}

function afficherStationsFiltrees(centreLat, centreLon, distanceMax, typeVehicule) {
    marqueursOriginaux.forEach(function(marqueur) {
        cartePrincipale.removeLayer(marqueur);
    });
    marqueurs.forEach(function(marqueur) {
        cartePrincipale.removeLayer(marqueur);
    });
    marqueurs = [];

    if (marqueurUtilisateur) {
        cartePrincipale.removeLayer(marqueurUtilisateur);
    }

    let iconeUtilisateur = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    marqueurUtilisateur = L.marker([centreLat, centreLon], {icon: iconeUtilisateur})
        .addTo(cartePrincipale)
        .bindPopup('<b>Votre position</b>')
        .openPopup();

    cartePrincipale.setView([centreLat, centreLon], 14);

    let stationsFiltrees = toutesLesStations.filter(function(station) {
        let distance = calculerDistance(centreLat, centreLon, station.latitude, station.longitude);
        let correspondDistance = distance <= distanceMax;
        let correspondType = !typeVehicule || station.type_vehicule === typeVehicule;

        if (correspondDistance && correspondType) {
            station.distance = distance;
            return true;
        }
        return false;
    });

    stationsFiltrees.sort(function(a, b) {
        return a.distance - b.distance;
    });

    const typeAbonnement = window.getTypeAbonnement();
    const abonnement = abonnementsFiltre[typeAbonnement];

    stationsFiltrees.forEach(function(station) {
        const marqueur = L.marker([station.latitude, station.longitude]).addTo(cartePrincipale);

        marqueur.bindPopup(`
            <b>${station.nom}</b><br>
            Type: ${station.type_vehicule}<br>
            Capacité: ${station.capacite}<br>
            Distance: ${station.distance.toFixed(2)} km
            <br><br><strong>Votre abonnement</strong><br>
            Type : ${abonnement.nom}<br>
            Temps disponibles : ${abonnement.minutes}<br>
            Prix : ${abonnement.prix}<br><br>
            <button onclick="ouvrirModalLocation(${station.id}, '${station.nom.replace(/'/g, "\\'")}', '${station.type_vehicule}')"
                class="btn btn-success w-100">
                Louer maintenant
            </button>
        `);

        marqueurs.push(marqueur);
    });

    document.getElementById('nombreResultats').textContent = stationsFiltrees.length;
    document.getElementById('resultatsRecherche').style.display = 'block';

    console.log("Filtres appliqués : ", {
        centreLat, centreLon, distanceMax, typeVehicule,
        nbStationsAvant: toutesLesStations.length
    });

}

function chargerStationsPourFiltre() {
    return fetch('/api/stations/')
        .then(response => response.json())
        .then(donnees => {
            toutesLesStations = donnees;
            console.log("Stations chargées :", toutesLesStations);
        })
        .catch(erreur => console.error('Erreur de chargement stations :', erreur));
}

function gererSoumissionFiltre(e) {
    e.preventDefault();

    let adresse = document.getElementById('adresse').value;
    let distanceMax = parseFloat(document.getElementById('distanceMax').value) || 1000;
    let typeVehicule = document.getElementById('typeVehicule').value;

    if (adresse) {
        geocoderAdresse(adresse, function(position) {
            positionUtilisateur = position;
            afficherStationsFiltrees(position.lat, position.lon, distanceMax, typeVehicule);
        });
    } else if (positionUtilisateur) {
        afficherStationsFiltrees(positionUtilisateur.lat, positionUtilisateur.lon, distanceMax, typeVehicule);
    } else {
        alert('Veuillez entrer une adresse ou utiliser votre position actuelle.');
    }
}

function utiliserMaPosition() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            positionUtilisateur = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };

            let distanceMax = parseFloat(document.getElementById('distanceMax').value);
            let typeVehicule = document.getElementById('typeVehicule').value;

            afficherStationsFiltrees(positionUtilisateur.lat, positionUtilisateur.lon, distanceMax, typeVehicule);

            document.getElementById('adresse').value = 'Position actuelle';
        }, function(erreur) {
            console.error('Erreur de géolocalisation:', erreur);
            alert('Impossible d\'obtenir votre position. Veuillez vérifier les permissions de géolocalisation.');
        });
    } else {
        alert('La géolocalisation n\'est pas supportée par votre navigateur.');
    }
}

function sauvegarderMarqueursOriginaux(marqueurs) {
    marqueursOriginaux = marqueurs;
}

function initialiserFiltre(carte) {
    cartePrincipale = carte;

    chargerStationsPourFiltre().then(() => {
        let formulaireFiltre = document.getElementById('formulaireFiltre');
        if (formulaireFiltre) {
            formulaireFiltre.addEventListener('submit', gererSoumissionFiltre);
        }

        let boutonPosition = document.getElementById('utiliserMaPosition');
        if (boutonPosition) {
            boutonPosition.addEventListener('click', utiliserMaPosition);
        }
    });
}

window.initialiserFiltre = initialiserFiltre;
window.sauvegarderMarqueursOriginaux = sauvegarderMarqueursOriginaux;