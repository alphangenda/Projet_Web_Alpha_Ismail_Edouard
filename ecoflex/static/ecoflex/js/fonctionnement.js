"use strict";
document.addEventListener("DOMContentLoaded", function () {
    let select = document.getElementById("choix-fonctionnement");

    select.addEventListener("change", function () {
        let choix = this.value;

        document.getElementById("bloc-velo").style.display = "none";
        document.getElementById("bloc-trottinette").style.display = "none";
        document.getElementById("bloc-voiture").style.display = "none";

        if (choix === "velo") {
            document.getElementById("bloc-velo").style.display = "block";
        } else if (choix === "trottinette") {
            document.getElementById("bloc-trottinette").style.display = "block";
        } else if (choix === "voiture") {
            document.getElementById("bloc-voiture").style.display = "block";
        }
    });
});
