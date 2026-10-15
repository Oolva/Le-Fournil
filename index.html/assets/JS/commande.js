
const CLE_PANIER = "panierLeFournil";

function lirePanierCommande() {
    return JSON.parse(localStorage.getItem(CLE_PANIER) || "[]");
}

function formaterPrixCommande(prix) {
    return prix.toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR"
    });
}

const formulaire = document.getElementById("formulaire-commande");
const recapitulatif = document.getElementById("recapitulatif-commande");
const confirmationFinale = document.getElementById("confirmation-finale");

const detailsClient = document.getElementById("details-client");
const detailsProduits = document.getElementById("details-produits");
const totalCommande = document.getElementById("total-commande");

const boutonConfirmer = document.getElementById("confirmer-commande");
const boutonModifier = document.getElementById("modifier-commande");

let commandeEnCours = null;

// Vérifier la date de retrait
const champDate = document.getElementById("date-retrait");

if (champDate) {
    const aujourdHui = new Date();
    const annee = aujourdHui.getFullYear();
    const mois = String(aujourdHui.getMonth() + 1).padStart(2, "0");
    const jour = String(aujourdHui.getDate()).padStart(2, "0");

    champDate.min = `${annee}-${mois}-${jour}`;
}

// Préparer le récapitulatif
if (formulaire) {
    formulaire.addEventListener("submit", function (event) {
        event.preventDefault();

        const panier = lirePanierCommande();

        if (panier.length === 0) {
            alert("Votre panier est vide. Ajoutez des produits avant de commander.");
            window.location.href = "carte.html";
            return;
        }

        const donnees = new FormData(formulaire);

        commandeEnCours = {
            prenom: donnees.get("prenom"),
            nom: donnees.get("nom"),
            email: donnees.get("email"),
            telephone: donnees.get("telephone"),
            dateRetrait: donnees.get("date-retrait"),
            heureRetrait: donnees.get("heure-retrait"),
            produits: panier.map(produit => ({ ...produit }))
        };

        afficherRecapitulatif(commandeEnCours);

        formulaire.hidden = true;
        recapitulatif.hidden = false;

        recapitulatif.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}

function afficherRecapitulatif(commande) {
    detailsClient.replaceChildren();
    detailsProduits.replaceChildren();

    const informations = [
        `Client : ${commande.prenom} ${commande.nom}`,
        `E-mail : ${commande.email}`,
        `Téléphone : ${commande.telephone}`,
        `Date de retrait : ${commande.dateRetrait}`,
        `Créneau souhaité : ${commande.heureRetrait}`
    ];

    informations.forEach(texte => {
        const paragraphe = document.createElement("p");
        paragraphe.textContent = texte;
        detailsClient.appendChild(paragraphe);
    });

    let total = 0;

    commande.produits.forEach(produit => {
        const ligne = document.createElement("p");
        const sousTotal = produit.prix * produit.quantite;

        ligne.textContent =
            `${produit.nom} × ${produit.quantite} : ` +
            formaterPrixCommande(sousTotal);

        detailsProduits.appendChild(ligne);
        total += sousTotal;
    });

    totalCommande.textContent = formaterPrixCommande(total);
}

// Revenir au formulaire pour modifier les informations
if (boutonModifier) {
    boutonModifier.addEventListener("click", function () {
        recapitulatif.hidden = true;
        formulaire.hidden = false;

        formulaire.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}


function formaterDateCommande(date) {
    if (!date) return "";

    const [annee, mois, jour] = date.split("-");
    return `${jour}/${mois}/${annee}`;
}

// Confirmer la commande de démonstration
if (boutonConfirmer) {
    boutonConfirmer.addEventListener("click", function () {
        if (!commandeEnCours) return;

        const panierActuel = lirePanierCommande();

        if (panierActuel.length === 0) {
            alert("Le panier est vide. Veuillez recommencer.");
            window.location.href = "carte.html";
            return;
        }

        // Numéro de démonstration, sans enregistrement sur serveur
        const numeroCommande =
            "DEMO-" + Date.now().toString().slice(-8);

        document.getElementById("numero-commande").textContent =
            numeroCommande;

        document.getElementById("date-confirmation").textContent =
            formaterDateCommande(commandeEnCours.dateRetrait);

        document.getElementById("heure-confirmation").textContent =
            commandeEnCours.heureRetrait;

        const listeProduits =
            document.getElementById("produits-confirmation");

        listeProduits.replaceChildren();

        let total = 0;

        commandeEnCours.produits.forEach(function (produit) {
            const ligne = document.createElement("p");
            const sousTotal = produit.prix * produit.quantite;

            const nom = document.createElement("span");
            nom.textContent =
                `${produit.nom} × ${produit.quantite}`;

            const prix = document.createElement("strong");
            prix.textContent = formaterPrixCommande(sousTotal);

            ligne.append(nom, prix);
            listeProduits.appendChild(ligne);

            total += sousTotal;
        });

        document.getElementById("total-confirmation").textContent =
            formaterPrixCommande(total);

        document.getElementById("message-confirmation").textContent =
            `Merci ${commandeEnCours.prenom} ! Votre commande de démonstration a été confirmée.`;

        // Vider le panier après confirmation
        localStorage.setItem(CLE_PANIER, JSON.stringify([]));

        confirmationFinale.hidden = false;
        recapitulatif.hidden = true;
        formulaire.hidden = true;

        confirmationFinale.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}

