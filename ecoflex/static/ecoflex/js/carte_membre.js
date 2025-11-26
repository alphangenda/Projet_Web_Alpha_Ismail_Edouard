'use strict';

function toggleCarte() {
    const widget = document.getElementById('carteMembreWidget');
    widget.classList.toggle('expanded');
}

document.addEventListener('click', function(event) {
    const widget = document.getElementById('carteMembreWidget');
    if (widget && widget.classList.contains('expanded') && !widget.contains(event.target)) {
        widget.classList.remove('expanded');
    }
});

window.toggleCarte = toggleCarte;