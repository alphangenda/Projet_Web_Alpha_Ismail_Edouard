/* global bootstrap */

window.afficherMessage = function(type, texte) {
    const zone = document.getElementById('zoneMessagesEcoflex');
    const message = document.createElement('div');
    message.className = `alert alert-${type} alert-dismissible fade show shadow`;
    message.innerHTML = `${texte}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    zone.appendChild(message);
    setTimeout(() => message.remove(), 4000);
};

window.demanderConfirmation = function(texte, action) {
    const modal = new bootstrap.Modal(document.getElementById('modalConfirmationEcoflex'));
    document.getElementById('contenuConfirmationEcoflex').innerText = texte;
    const bouton = document.getElementById('btnConfirmerEcoflex');

    bouton.onclick = () => {
        modal.hide();
        action();
    };

    modal.show();
};
