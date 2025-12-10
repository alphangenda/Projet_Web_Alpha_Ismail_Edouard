

let rechercheTimeout = null;

function rechercherStationsAjax(query) {
    if (query.length < 2) {
    const cont = document.getElementById('conteneur-recherche-ajax');
    document.getElementById('resultats-recherche-ajax').innerHTML = '';
    document.getElementById('resultats-recherche-ajax').style.display = 'none';
    cont.style.paddingBottom = "0";
    return;
    }

    fetch(`/api/rechercher-stations/?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            afficherResultatsRecherche(data);
        })
        .catch(error => {
            console.error('Erreur recherche AJAX:', error);
        });
}

function afficherResultatsRecherche(data) {
    const conteneur = document.getElementById('resultats-recherche-ajax');

    if (!data.success || data.results.length === 0) {
        conteneur.innerHTML = '<div class="p-3 text-muted text-center">Aucune station trouvée</div>';
        conteneur.style.display = 'block';
        return;
    }

    let html = '<div class="list-group">';

    data.results.forEach(station => {
        const icone = station.type_vehicule === 'velo' ? '🚴' :
                     station.type_vehicule === 'trottinette' ? '🛴' : '🚗';

        html += `
            <a href="#" class="list-group-item list-group-item-action result-item"
               onclick="selectionnerStation(${station.latitude}, ${station.longitude}, '${station.nom}'); return false;">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${icone} ${station.nom}</strong><br>
                        <small class="text-muted">${station.type_vehicule}</small>
                    </div>
                    <span class="badge bg-primary">${station.capacite} disponible(s)</span>
                </div>
            </a>
        `;
    });

    html += '</div>';
    conteneur.innerHTML = html;
    conteneur.style.display = 'block';


}

document.getElementById("resultats-recherche-ajax").addEventListener("click", function (e) {
    const item = e.target.closest(".result-item");

    if (item) {
        const map = document.getElementById("map");

        map.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        setTimeout(() => {
            window.scrollBy({
                top: -50,
                behavior: "smooth"
            });
        }, 375);
    }
});




function selectionnerStation(lat, lon, nom) {
    if (window.mapInstance) {
        window.mapInstance.setView([lat, lon], 16);
        document.getElementById('resultats-recherche-ajax').style.display = 'none';
        document.getElementById('input-recherche-ajax').value = nom;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const inputRecherche = document.getElementById('input-recherche-ajax');

    if (inputRecherche) {
        inputRecherche.addEventListener('input', function(e) {
            clearTimeout(rechercheTimeout);

            rechercheTimeout = setTimeout(() => {
                rechercherStationsAjax(e.target.value);
            }, 300);
        });

        document.addEventListener('click', function(e) {
            if (!e.target.closest('#conteneur-recherche-ajax')) {
                document.getElementById('resultats-recherche-ajax').style.display = 'none';
            }
        });
    }
});

window.selectionnerStation = selectionnerStation;