window.locationActive = false;

const abonnementsReservation = {
    occasionnelle: {
        nom: 'Occasionnelle',
        minutes: 0,
        prix: '0.50$ par minute'
    },
    journalier: {
        nom: 'Journalier',
        minutes: 1440,
        prix: '15.00$'
    },
    mensuel: {
        nom: 'Mensuel',
        minutes: 30,
        prix: 'Inclus'
    },
    annuel: {
        nom: 'Annuel',
        minutes: 30,
        prix: 'Inclus'
    }
};

function ouvrirModalLocation(stationId, stationNom, typeVehicule) {
    const typeAbo = window.getTypeAbonnement ? window.getTypeAbonnement() : 'occasionnelle';
    const abonnement = abonnementsReservation[typeAbo];

    const nomSecurise = stationNom.replace(/'/g, '\\\'').replace(/"/g, '\\"');

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

                    <div class="alert alert-info">
                    <p class="mb-1"><strong>Abonnement :</strong> ${abonnement.nom}</p>
                    <p class="mb-1"><strong>Temps inclus :</strong> ${abonnement.minutes > 0 ? abonnement.minutes + ' minutes' : 'Tarification à la minute'}</p>
                    <p class="mb-0"><strong>Tarif :</strong> ${abonnement.prix}</p>
                    </div>

                    <div class="mt-3">
                        <label for="numeroPermisInput" class="form-label fw-bold">Numéro de permis</label>
                        <input type="text" id="numeroPermisInput" class="form-control" maxlength="5" placeholder="Entrez votre numéro à 5 chiffres">
                        <div class="invalid-feedback">Veuillez entrer votre numéro de permis.</div>
                    </div>

                    <div class="alert alert-secondary">
                    <small>Cette réservation sera calculée automatiquement selon les conditions de votre abonnement.</small>
                    </div>
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
    const inputPermis = document.getElementById('numeroPermisInput');

    if (!bouton || !inputPermis) {
        return;
    }

    const numeroPermis = inputPermis.value.trim();

    if (!numeroPermis) {
        inputPermis.classList.add('is-invalid');
        return;
    }

    inputPermis.classList.remove('is-invalid');

    const texteOriginal = bouton.innerHTML;
    bouton.innerHTML = 'Location...';
    bouton.disabled = true;

    fetch(`/api/stations/${stationId}/louer/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ numero_permis: numeroPermis })
    })
        .then(async (reponse) => {
            const data = await reponse.json();
            if (!reponse.ok) {
                alert(data.error || 'Erreur lors de la réservation.');
                throw new Error(data.error || 'Erreur serveur');
            }
            return data;
        })
        .then((data) => {
            if (data.location_id) {
                localStorage.setItem('ecoflex_current_location_id', String(data.location_id));
            }

            alert(data.message || `Location confirmée à la station "${stationNom}".`);
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
            if (!window.marqueursActuels) return;

            const byId = new window.Map(stations.map(s => [s.id, s]));

            window.marqueursActuels.forEach(m => {
                const station = m.options.stationData;
                if (station && byId.has(station.id)) {
                    m.options.stationData = byId.get(station.id);
                    if (typeof window.creerContenuPopup === 'function') {
                        m.setPopupContent(window.creerContenuPopup(m.options.stationData));
                    }
                }
            });
        })
        .catch(error => {
            alert('Erreur lors de la location.');
        })
        .finally(() => {
            bouton.innerHTML = texteOriginal;
            bouton.disabled = false;
        });
}

window.ouvrirModalLocation = ouvrirModalLocation;
window.fermerModal = fermerModal;
window.confirmerLocation = confirmerLocation;