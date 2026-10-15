
const CLE_PANIER = "panierLeFournil";

function lirePanier(){
    return JSON.parse(localStorage.getItem(CLE_PANIER) || "[]");
}


function actualiserCompteursPanier() {
    const panier = lirePanier();

    // Additionne les quantités de tous les produits
    const nombreArticles = panier.reduce(
        (total, produit) => total + produit.quantite,
        0
    );

    document.querySelectorAll("[data-compteur-panier]")
        .forEach(compteur => {
            compteur.textContent = nombreArticles;
            compteur.setAttribute(
                "aria-label",
                `${nombreArticles} article(s) dans le panier`
            );
        });
}


function enregistrerPanier(panier) {
    localStorage.setItem(CLE_PANIER, JSON.stringify(panier));
}

function formaterPrix(prix) {
    return prix.toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR"
    });
}

// Ajouter un produit depuis la page Carte
document.addEventListener("click", function (event) {
    const bouton = event.target.closest(".ajouter-panier");

    if (!bouton) return;

    const panier = lirePanier();
    const id = bouton.dataset.id;
    const produitExistant = panier.find(produit => produit.id === id);

    if (produitExistant) {
        produitExistant.quantite++;
    } else {
        panier.push({
            id: id,
            nom: bouton.dataset.nom,
            prix: Number(bouton.dataset.prix),
            quantite: 1
        });
    }

    enregistrerPanier(panier);
    actualiserCompteursPanier();

    bouton.textContent = "✓ Ajouté au panier";
    

    setTimeout(() => {
        bouton.textContent = "🛒 Ajouter au panier";
    }, 1200);
});

// Afficher le panier
function afficherPanier() {
    const liste = document.getElementById("liste-panier");

    if (!liste) return;

    const panier = lirePanier();
    const message = document.getElementById("message-panier");
    const totalElement = document.getElementById("total-panier");

    liste.replaceChildren();

    let total = 0;

    message.hidden = panier.length > 0;

    panier.forEach(produit => {
        const ligne = document.createElement("div");
        ligne.className = "ligne-panier";

        const nom = document.createElement("h3");
        nom.textContent = produit.nom;

        const prix = document.createElement("p");
        prix.textContent = formaterPrix(produit.prix);

        const quantite = document.createElement("span");
        quantite.textContent = `Quantité : ${produit.quantite}`;

        const diminuer = document.createElement("button");
        diminuer.type = "button";
        diminuer.textContent = "−";
        diminuer.setAttribute("aria-label", `Diminuer ${produit.nom}`);
        diminuer.addEventListener("click", () => modifierQuantite(produit.id, -1));

        const augmenter = document.createElement("button");
        augmenter.type = "button";
        augmenter.textContent = "+";
        augmenter.setAttribute("aria-label", `Augmenter ${produit.nom}`);
        augmenter.addEventListener("click", () => modifierQuantite(produit.id, 1));

        const supprimer = document.createElement("button");
        supprimer.type = "button";
        supprimer.textContent = "Supprimer";
        supprimer.addEventListener("click", () => supprimerProduit(produit.id));

        ligne.append(nom, prix, diminuer, quantite, augmenter, supprimer);
        liste.append(ligne);

        total += produit.prix * produit.quantite;
    });

    totalElement.textContent = formaterPrix(total);
}

function modifierQuantite(id, variation) {
    const panier = lirePanier();
    const produit = panier.find(element => element.id === id);

    if (!produit) return;

    produit.quantite += variation;

    const nouveauPanier = panier.filter(element => element.quantite > 0);
    enregistrerPanier(nouveauPanier);
    actualiserCompteursPanier();
    afficherPanier();
}

function supprimerProduit(id) {
    const panier = lirePanier().filter(produit => produit.id !== id);
    enregistrerPanier(panier);
    afficherPanier();
}

afficherPanier();
actualiserCompteursPanier();

window.addEventListener("storage", actualiserCompteursPanier);


// Vider complètement le panier
const boutonViderPanier = document.getElementById("vider-panier");

if (boutonViderPanier) {
    boutonViderPanier.addEventListener("click", function () {
        const panier = lirePanier();

        if (panier.length === 0) {
            alert("Ton panier est déjà vide.");
            return;
        }

        const confirmation = confirm(
            "Veux-tu vraiment supprimer tous les articles du panier ?"
        );

        if (confirmation) {
            enregistrerPanier([]);
            afficherPanier();
            actualiserCompteursPanier();
        }
    });
}
