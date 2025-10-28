document.addEventListener('DOMContentLoaded', function () {
    const chronoContainer = document.createElement('div');
    chronoContainer.id = 'chronoContainer';
    chronoContainer.style.position = 'fixed';
    chronoContainer.style.bottom = '20px';
    chronoContainer.style.left = '20px';
    chronoContainer.style.zIndex = '1100';
    chronoContainer.style.background = 'white';
    chronoContainer.style.border = '2px solid #28a745';
    chronoContainer.style.borderRadius = '12px';
    chronoContainer.style.boxShadow = '0 4px 12px black';
    chronoContainer.style.padding = '16px';
    chronoContainer.style.textAlign = 'center';
    chronoContainer.style.fontFamily = 'Arial, sans-serif';

    const chronoDisplay = document.createElement('div');
    chronoDisplay.id = 'chronoDisplay';
    chronoDisplay.style.fontSize = '24px';
    chronoDisplay.style.fontWeight = 'bold';
    chronoDisplay.style.color = '#28a745';
    chronoDisplay.innerText = '00:30:00';

    const startButton = document.createElement('button');
    startButton.id = 'startChrono';
    startButton.innerText = 'Démarrer la location';
    startButton.style.background = '#28a745';
    startButton.style.color = 'white';
    startButton.style.border = 'none';
    startButton.style.borderRadius = '8px';
    startButton.style.padding = '10px 16px';
    startButton.style.marginTop = '8px';
    startButton.style.cursor = 'pointer';
    startButton.style.transition = 'background 0.2s';
    startButton.onmouseover = () => startButton.style.background = '#218838';
    startButton.onmouseout = () => startButton.style.background = '#28a745';

    chronoContainer.appendChild(chronoDisplay);
    chronoContainer.appendChild(startButton);
    document.body.appendChild(chronoContainer);

    let tempsRestant = 30 * 60;
    let intervalID = null;
    let enCours = false;

    function formatageTemps(seconds) {
        const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    function startChrono() {
        if (enCours) return;
        enCours = true;

        intervalID = setInterval(() => {
            if (tempsRestant > 0) {
                tempsRestant--;
                chronoDisplay.innerText = formatageTemps(tempsRestant);
            } else {
                clearInterval(intervalID);
                chronoDisplay.innerText = 'Temps écoulé !';
                chronoDisplay.style.color = 'red';
                enCours = false;
            }
        }, 1000);
    }

    startButton.addEventListener('click', startChrono);
});
