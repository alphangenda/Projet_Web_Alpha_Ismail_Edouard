window.locationActive = false;

function ouvrirModalLocation(stationId, stationNom, typeVehicule) {

    fetch(`/api/abonnement/actif/${typeVehicule}/`)
    .then(r => r.json())
    .then(data => {

        window.abonnementInfo = data;

        afficherModalLocation(stationId, stationNom, typeVehicule);

    })
    .catch(() => {
        window.abonnementInfo = { has: false };
        afficherModalLocation(stationId, stationNom, typeVehicule);
    });
}

function afficherModalLocation(stationId, stationNom, typeVehicule) {

    const nomSecurise = stationNom.replace(/'/g, '\\\'').replace(/"/g, '\\"');
    const info = window.abonnementInfo || { has: false };

    let blocAbonnement = '';
    if (info.has) {
        const dureeTexte =
            info.duree_minutes && info.duree_minutes > 0
                ? `${info.duree_minutes} minutes`
                : 'Selon les conditions de votre abonnement';

        blocAbonnement = `
            <div class="alert alert-info">
                <p class="mb-1"><strong>Abonnement :</strong> ${info.libelle}</p>
                <p class="mb-1"><strong>Temps inclus :</strong> ${dureeTexte}</p>
                <p class="mb-0"><strong>Tarif :</strong> ${info.prix}</p>
            </div>
            <div class="alert alert-secondary">
                <small>Cette réservation sera calculée automatiquement selon les conditions de votre abonnement.</small>
            </div>
        `;
    } else {
        blocAbonnement = `
            <div class="alert alert-warning">
                <strong>Aucun abonnement actif.</strong><br>
                Veuillez <a href="/abonnement/">choisir un type d'abonnement</a> pour bénéficier des meilleurs tarifs.
            </div>
        `;
    }

    const modalHTML = `
        <div class="modal fade show d-block" id="modalLocation" tabindex="-1" style="background: rgba(0,0,0,0.6);">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">

                <div class="modal-header">
                    <h5 class="modal-title">Réserver un véhicule</h5>
                    <button type="button" class="btn-close" onclick="fermerModal()"></button>
                </div>

                <div class="modal-body">
                    <div class="alert alert-light">
                        <p class="mb-1"><strong>Station :</strong> ${stationNom}</p>
                        <p class="mb-0"><strong>Type :</strong> ${typeVehicule}</p>
                    </div>

                    ${blocAbonnement}
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="fermerModal()">Annuler</button>
                    <button type="button" class="btn btn-success" onclick="confirmerLocation(${stationId}, '${nomSecurise}')">Confirmer</button>
                </div>

            </div>
        </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function fermerModal() {
    const modal = document.getElementById('modalLocation');
    if (modal) {
        modal.remove();
    }
}

function confirmerLocation(stationId, stationNom) {
    const bouton = document.querySelector('#modalLocation .btn-success');

    if (!bouton) {
        return;
    }

    const texteOriginal = bouton.innerHTML;
    bouton.innerHTML = 'Location...';
    bouton.disabled = true;

    fetch(`/api/stations/${stationId}/louer/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({})
    })
        .then(async (reponse) => {
            const data = await reponse.json();
            if (!reponse.ok) {
                if (typeof window.afficherMessage === 'function') {
                    window.afficherMessage('danger', data.error || 'Erreur lors de la réservation.');
                }
                throw new Error(data.error || 'Erreur serveur');
            }
            return data;
        })
        .then((data) => {
            if (data.location_id) {
                localStorage.setItem('ecoflex_current_location_id', String(data.location_id));
            }

            if (typeof window.afficherMessage === 'function') {
                window.afficherMessage('success', data.message || `Location confirmée à la station "${stationNom}".`);
            }
            fermerModal();

            window.locationActive = true;

            const heureDebut = Date.now();
            const tempsInitial = 30 * 60;

            if (typeof window.sauvegarderEtatLocation === 'function') {
                window.sauvegarderEtatLocation(heureDebut, tempsInitial);
            }

            if (typeof window.demarrerChronometre === 'function') {
                setTimeout(() => {
                    window.demarrerChronometre(false);
                }, 100);
            }

            return fetch('/api/stations/').then(r => r.json());
        })
        .then(stations => {
            const byId = new window.Map(stations.map(s => [s.id, s]));

            if (Array.isArray(window.marqueursActuels)) {
                window.marqueursActuels.forEach(m => {
                    const station = m.options.stationData;
                    if (station && byId.has(station.id)) {
                        m.options.stationData = byId.get(station.id);
                        if (typeof window.creerContenuPopup === 'function') {
                            m.setPopupContent(window.creerContenuPopup(m.options.stationData));
                        }
                    }
                });
            }
            if (Array.isArray(window.marqueursFiltres)) {
                window.marqueursFiltres.forEach(m => {
                    const station = m.options.stationData;
                    if (station && byId.has(station.id)) {
                        m.options.stationData = byId.get(station.id);
                        if (typeof window.creerContenuPopup === 'function') {
                            m.setPopupContent(window.creerContenuPopup(m.options.stationData));
                        }
                    }
                });
            }
        })
        .catch(error => {
            if (typeof window.afficherMessage === 'function') {
                window.afficherMessage('danger', 'Erreur lors de la location.');
            }
        })
        .finally(() => {
            bouton.innerHTML = texteOriginal;
            bouton.disabled = false;
        });
}

window.ouvrirModalLocation = ouvrirModalLocation;
window.fermerModal = fermerModal;
window.confirmerLocation = confirmerLocation;