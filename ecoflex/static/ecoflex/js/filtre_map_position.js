/* global L */
'use strict';

let cartePrincipale;
let toutesLesStations = [];
let marqueurs = [];
let marqueurUtilisateur = null;
let positionUtilisateur = null;

//Calculer la distance entre deux points
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

//Géocoder une adresse
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

//Afficher les stations filtrées
function afficherStationsFiltrees(centreLat, centreLon, distanceMax, typeVehicule) {
    //Supprimer les anciens marqueurs sans enlever celui de l'utilisateur
    marqueurs.forEach(function(marqueur) {
        cartePrincipale.removeLayer(marqueur);
    });
    marqueurs = [];

    //Ajouter ou mettre à jour le marqueur de position utilisateur
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
        .bindPopup('<b> Votre position</b>')
        .openPopup();

    //Centrer la carte sur la position
    cartePrincipale.setView([centreLat, centreLon], 14);

    //Filtrer et trier les stations
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

    //Trier par distance
    stationsFiltrees.sort(function(a, b) {
        return a.distance - b.distance;
    });

    //Afficher les stations filtrées
    stationsFiltrees.forEach(function(station) {
        let marqueur = L.marker([station.latitude, station.longitude]).addTo(cartePrincipale);
        marqueur.bindPopup(
            '<b>' + station.nom + '</b><br>' +
            'Type: ' + station.type_vehicule + '<br>' +
            'Capacité: ' + station.capacite + '<br>' +
            'Distance: ' + station.distance.toFixed(2) + ' km'
        );
        marqueurs.push(marqueur);
    });

    //Afficher le nombre de résultats
    document.getElementById('nombreResultats').textContent = stationsFiltrees.length;
    document.getElementById('resultatsRecherche').style.display = 'block';
}

//Charger toutes les stations pour le filtre
function chargerStationsPourFiltre() {
    fetch('/api/stations/')
        .then(function(reponse) {
            return reponse.json();
        })
        .then(function(donnees) {
            toutesLesStations = donnees;
        })
        .catch(function(erreur) {
            console.error('Erreur lors du chargement des stations pour le filtre:', erreur);
        });
}

//Gestionnaire du formulaire de recherche
function gererSoumissionFiltre(e) {
    e.preventDefault();

    let adresse = document.getElementById('adresse').value;
    let distanceMax = parseFloat(document.getElementById('distanceMax').value);
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

//Utiliser la géolocalisation
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

//Initialiser le filtre après le chargement de la carte
function initialiserFiltre(carte) {
    cartePrincipale = carte;
    chargerStationsPourFiltre();

    let formulaireFiltre = document.getElementById('formulaireFiltre');
    if (formulaireFiltre) {
        formulaireFiltre.addEventListener('submit', gererSoumissionFiltre);
    }

    let boutonPosition = document.getElementById('utiliserMaPosition');
    if (boutonPosition) {
        boutonPosition.addEventListener('click', utiliserMaPosition);
    }
}

window.initialiserFiltre = initialiserFiltre;