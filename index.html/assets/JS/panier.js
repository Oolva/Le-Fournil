
/* ============================================================
   1. CONFIGURATION DU PANIER
   ============================================================ */

/*
   Déclaration d'une constante qui contient le nom de la clé utilisée pour enregistrer le panier dans le navigateur.

   Cette clé doit être identique dans les fichiers panier.js et commande.js afin que les deux scripts utilisent le même panier.
*/
const CLE_PANIER = "panierLeFournil";


/* ============================================================
   2. LIRE LE CONTENU DU PANIER
   ============================================================ */

/*
   Cette fonction récupère les produits enregistrés dans le stockage local du navigateur.

   localStorage.getItem() lit une donnée grâce à sa clé.
   JSON.parse() transforme le texte JSON en tableau JavaScript.

   Si aucune donnée n'est enregistrée, || "[]" permet de retourner un tableau vide par défaut.
*/
function lirePanier(){
    return JSON.parse(localStorage.getItem(CLE_PANIER) || "[]");
}


/* ============================================================
   3. ACTUALISER LE COMPTEUR DU PANIER
   ============================================================ */

/*
   Cette fonction calcule le nombre total d'articles présents dans le panier et actualise les compteurs affichés dans la navigation du site.
*/
function actualiserCompteursPanier() {

    // Récupération du panier enregistré dans le navigateur.
    const panier = lirePanier();


    /*
       reduce() permet de parcourir un tableau et de calculer une seule valeur à partir de tous ses éléments.

       Ici :
       - total représente le cumul des quantités ;
       - produit représente le produit actuellement parcouru ;
       - produit.quantite correspond à sa quantité commandée ;
       - 0 est la valeur initiale du cumul.

       Exemple :
       2 croissants + 3 baguettes = 5 articles.
    */
    const nombreArticles = panier.reduce(
        (total, produit) => total + produit.quantite,
        0
    );


    /*
       querySelectorAll() sélectionne tous les éléments HTML possédant l'attribut data-compteur-panier.

       forEach() parcourt chaque compteur trouvé pour actualiser son contenu.
    */
    document.querySelectorAll("[data-compteur-panier]")
        .forEach(compteur => {

            // Affichage du nombre total d'articles.
            compteur.textContent = nombreArticles;

            /*
               setAttribute() permet de définir un attribut HTML.

               aria-label améliore l'accessibilité :
               les lecteurs d'écran peuvent annoncer le nombre d'articles présents dans le panier.
            */
            compteur.setAttribute(
                "aria-label",
                `${nombreArticles} article(s) dans le panier`
            );
        });
}


/* ============================================================
   4. ENREGISTRER LE PANIER
   ============================================================ */

/*
   Cette fonction sauvegarde le panier dans le navigateur.

   JSON.stringify() transforme le tableau JavaScript en texte JSON, car localStorage ne stocke que des chaînes de caractères.

   setItem() enregistre cette chaîne sous la clé CLE_PANIER.
*/
function enregistrerPanier(panier) {
    localStorage.setItem(CLE_PANIER, JSON.stringify(panier));
}


/* ============================================================
   5. FORMATER LES PRIX
   ============================================================ */

/*
   Cette fonction transforme un nombre en prix au format français.

   toLocaleString() adapte l'affichage selon la langue choisie.
   style: "currency" indique qu'il s'agit d'une devise.
   currency: "EUR" précise que la devise est l'euro.

   Exemple : 4.5 devient 4,50 €.
*/
function formaterPrix(prix) {
    return prix.toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR"
    });
}


/* ============================================================
   6. AJOUTER UN PRODUIT AU PANIER
   ============================================================ */

/*
   addEventListener() permet d'écouter un événement.

   Ici, on écoute les clics effectués dans tout le document HTML.

   Cette méthode permet de gérer les clics sur les boutons
   Ajouter au panier présents sur la page carte.html.
*/
document.addEventListener("click", function (event) {

    /*
       event représente l'événement déclenché par l'utilisateur.
       event.target correspond à l'élément sur lequel il a cliqué.

       closest(".ajouter-panier") recherche le bouton correspondant à cette classe, y compris si le clic
       a été effectué sur un élément situé à l'intérieur du bouton.
    */
    const bouton = event.target.closest(".ajouter-panier");


    /*
       Si aucun bouton Ajouter au panier n'a été trouvé, return arrête immédiatement l'exécution de la fonction.

       Cela évite de traiter les autres clics du site comme des demandes d'ajout de produit.
    */
    if (!bouton) return;


    // Récupération du panier actuel.
    const panier = lirePanier();


    /*
       dataset permet de récupérer les attributs HTML personnalisés qui commencent par data-.

       Exemple dans carte.html :
       data-id="croissant"
       data-nom="Croissant"
       data-prix="1.20"

       Ces informations permettent d'identifier le produit et de connaître son nom et son prix.
    */
    const id = bouton.dataset.id;


    /*
       find() recherche dans le tableau le premier produit dont l'identifiant correspond à celui du bouton.

       Si le produit existe, find() retourne son objet.
       Sinon, la méthode retourne undefined.
    */
    const produitExistant = panier.find(produit => produit.id === id);


    /*
       if / else permet de choisir entre deux situations :

       1. Le produit existe déjà dans le panier : on augmente simplement sa quantité.

       2. Le produit n'existe pas encore : on crée un nouvel objet produit et on l'ajoute au tableau.
    */
    if (produitExistant) {

        // Incrémente la quantité du produit déjà présent.
        produitExistant.quantite++;

    } else {

        /*
           push() ajoute un nouvel élément à la fin du tableau.

           On crée un objet contenant :
           - id : identifiant unique du produit ;
           - nom : nom du produit ;
           - prix : prix unitaire ;
           - quantite : quantité initiale fixée à 1.

           Number() transforme le prix récupéré depuis HTML en valeur numérique pour permettre les calculs.
        */
        panier.push({
            id: id,
            nom: bouton.dataset.nom,
            prix: Number(bouton.dataset.prix),
            quantite: 1
        });
    }


    /*
       Une fois le produit ajouté ou sa quantité modifiée, on sauvegarde le nouveau panier.
    */
    enregistrerPanier(panier);


    /*
       On actualise immédiatement le compteur visible dans la navigation du site.
    */
    actualiserCompteursPanier();


    /*
       On modifie temporairement le texte du bouton pour informer visuellement l'utilisateur que le produit a bien été ajouté.
    */
    bouton.textContent = "✓ Ajouté au panier";


    /*
       setTimeout() permet d'exécuter une instruction après un délai défini en millisecondes.

       Ici, après 1200 millisecondes (1,2 seconde), le texte initial du bouton est rétabli.
    */
    setTimeout(() => {
        bouton.textContent = "🛒 Ajouter au panier";
    }, 1200);
});


/* ============================================================
   7. AFFICHER LE CONTENU DU PANIER
   ============================================================ */

/*
   Cette fonction construit dynamiquement le contenu de la page panier.html.

   Le mot dynamiquement signifie que les éléments HTML sont créés par JavaScript en fonction des produits
   réellement présents dans le panier.
*/
function afficherPanier() {

    /*
       On récupère la zone HTML dans laquelle les produits du panier seront affichés.
    */
    const liste = document.getElementById("liste-panier");


    /*
       Si la zone n'existe pas sur la page actuelle, on arrête la fonction.

       Cela permet notamment d'utiliser panier.js sur d'autres pages du site sans provoquer d'erreur.
    */
    if (!liste) return;


    // Récupération des données du panier.
    const panier = lirePanier();


    // Récupération du message affiché lorsque le panier est vide.
    const message = document.getElementById("message-panier");


    // Récupération de la zone affichant le montant total.
    const totalElement = document.getElementById("total-panier");


    /*
       replaceChildren() supprime les éléments enfants déjà présents dans la liste.

       Cela évite de dupliquer les produits lorsque la fonction afficherPanier() est appelée plusieurs fois.
    */
    liste.replaceChildren();


    /*
       Initialisation du total à zéro.
       Chaque sous-total de produit sera ajouté à cette variable.
    */
    let total = 0;


    /*
       hidden est une propriété HTML qui masque un élément.

       Si le panier contient au moins un produit :
       panier.length > 0 vaut true.
       message.hidden devient true et le message disparaît.

       Si le panier est vide :
       panier.length > 0 vaut false.
       Le message est donc affiché.
    */
    message.hidden = panier.length > 0;


    /*
       forEach() parcourt tous les produits présents dans le panier.

       Pour chaque produit, le programme crée une ligne HTML contenant son nom, son prix, sa quantité et ses boutons.
    */
    panier.forEach(produit => {

        /*
           Création d'un conteneur div.
           Chaque produit disposera de sa propre ligne.
        */
        const ligne = document.createElement("div");


        /*
           className permet d'attribuer une classe CSS à l'élément créé.

           La classe ligne-panier permet d'appliquer les règles de mise en forme définies dans style.css.
        */
        ligne.className = "ligne-panier";


        // Création du titre contenant le nom du produit.
        const nom = document.createElement("h3");

        // Insertion du nom du produit dans le titre.
        nom.textContent = produit.nom;


        // Création du paragraphe contenant le prix unitaire.
        const prix = document.createElement("p");

        // Formatage du prix avant son affichage.
        prix.textContent = formaterPrix(produit.prix);


        // Création d'un élément span pour afficher la quantité.
        const quantite = document.createElement("span");

        // Affichage de la quantité actuellement commandée.
        quantite.textContent = `Quantité : ${produit.quantite}`;


        /* ----------------------------------------------------
           BOUTON POUR DIMINUER LA QUANTITÉ
           ---------------------------------------------------- */

        // Création du bouton de diminution.
        const diminuer = document.createElement("button");

        /*
           type="button" évite que le bouton déclenche l'envoi d'un formulaire s'il se trouve à l'intérieur
           d'une balise form.
        */
        diminuer.type = "button";

        // Symbole affiché sur le bouton.
        diminuer.textContent = "−";


        /*
           Ajout d'un aria-label pour l'accessibilité.

           Le lecteur d'écran pourra annoncer :
           "Diminuer Croissant", par exemple.
        */
        diminuer.setAttribute("aria-label", `Diminuer ${produit.nom}`);


        /*
           Au clic, on appelle modifierQuantite().

           Les deux arguments transmis sont :
           - produit.id : identifiant du produit ;
           - -1 : variation négative pour diminuer la quantité.
        */
        diminuer.addEventListener("click", () => modifierQuantite(produit.id, -1));


        /* ----------------------------------------------------
           BOUTON POUR AUGMENTER LA QUANTITÉ
           ---------------------------------------------------- */

        // Création du bouton d'augmentation.
        const augmenter = document.createElement("button");

        augmenter.type = "button";

        // Symbole affiché sur le bouton.
        augmenter.textContent = "+";


        // Texte destiné à améliorer l'accessibilité du bouton.
        augmenter.setAttribute("aria-label", `Augmenter ${produit.nom}`);


        /*
           Au clic, on appelle modifierQuantite() avec :
           - l'identifiant du produit ;
           - 1 pour augmenter sa quantité d'une unité.
        */
        augmenter.addEventListener("click", () => modifierQuantite(produit.id, 1));


        /* ----------------------------------------------------
           BOUTON POUR SUPPRIMER UN PRODUIT
           ---------------------------------------------------- */

        // Création du bouton de suppression.
        const supprimer = document.createElement("button");

        supprimer.type = "button";

        supprimer.textContent = "Supprimer";


        /*
           Au clic, la fonction supprimerProduit() reçoit l'identifiant du produit à retirer du panier.
        */
        supprimer.addEventListener("click", () => supprimerProduit(produit.id));


        /* ----------------------------------------------------
           ASSEMBLAGE DE LA LIGNE DU PANIER
           ---------------------------------------------------- */

        /*
           append() permet d'ajouter plusieurs éléments HTML dans un même conteneur.

           On assemble ici :
           - le nom ;
           - le prix ;
           - le bouton diminuer ;
           - la quantité ;
           - le bouton augmenter ;
           - le bouton supprimer.
        */
        ligne.append(nom, prix, diminuer, quantite, augmenter, supprimer);


        /*
           append() ajoute la ligne complète dans la liste principale du panier.
        */
        liste.append(ligne);


        /*
           Calcul du sous-total de chaque produit :
           prix unitaire multiplié par quantité.

           On ajoute ensuite ce résultat au total général.
        */
        total += produit.prix * produit.quantite;
    });


    /*
       Une fois tous les produits parcourus, on affiche le montant total du panier au format français et en euros.
    */
    totalElement.textContent = formaterPrix(total);
}


/* ============================================================
   8. MODIFIER LA QUANTITÉ D'UN PRODUIT
   ============================================================ */

/*
   Cette fonction reçoit deux paramètres :
   - id : identifiant du produit concerné ;
   - variation : valeur indiquant l'augmentation ou la diminution.

   Exemple :
   modifierQuantite("croissant", 1) augmente la quantité.
   modifierQuantite("croissant", -1) diminue la quantité.
*/
function modifierQuantite(id, variation) {

    // Récupération du panier actuel.
    const panier = lirePanier();


    /*
       find() recherche le produit correspondant à l'identifiant.
       element représente chaque produit parcouru dans le tableau.
    */
    const produit = panier.find(element => element.id === id);


    /*
       Si le produit n'est pas trouvé, on arrête la fonction pour éviter une erreur.
    */
    if (!produit) return;


    /*
       On ajoute la variation à la quantité existante.

       Exemple :
       quantité = 2 et variation = 1 : nouvelle quantité = 3.
       quantité = 2 et variation = -1 : nouvelle quantité = 1.
    */
    produit.quantite += variation;


    /*
       filter() crée un nouveau tableau en conservant uniquement les éléments qui respectent la condition.

       Ici, on conserve les produits dont la quantité est strictement supérieure à zéro.

       Si la quantité devient égale à zéro, le produit est donc retiré du panier.
    */
    const nouveauPanier = panier.filter(element => element.quantite > 0);


    // Enregistrement du nouveau panier dans localStorage.
    enregistrerPanier(nouveauPanier);


    // Actualisation du compteur dans la navigation.
    actualiserCompteursPanier();


    /*
       Réaffichage complet du panier afin de mettre à jour :
       les quantités, les produits et le montant total.
    */
    afficherPanier();
}


/* ============================================================
   9. SUPPRIMER UN PRODUIT DU PANIER
   ============================================================ */

/*
   Cette fonction permet de retirer complètement un produit du panier à partir de son identifiant.
*/
function supprimerProduit(id) {

    /*
       On récupère le panier puis on utilise filter() pour créer un nouveau tableau.

       La condition produit.id !== id signifie :
       conserver tous les produits dont l'identifiant est différent de celui du produit à supprimer.
    */
    const panier = lirePanier().filter(produit => produit.id !== id);


    // Enregistrement du panier sans le produit supprimé.
    enregistrerPanier(panier);


    // Actualisation de l'affichage de la page panier.
    afficherPanier();
}


/* ============================================================
   10. INITIALISATION DU PANIER
   ============================================================ */

/*
   Ces deux appels de fonctions sont exécutés lorsque le fichier JavaScript est chargé.

   afficherPanier() : affiche les produits et le montant total.

   actualiserCompteursPanier() : met à jour le nombre d'articles dans la navigation.
*/
afficherPanier();
actualiserCompteursPanier();


/*
   L'événement storage est déclenché dans un autre document lorsque le même stockage local est modifié.

   Exemple :
   le panier est modifié dans un autre onglet du navigateur.

   actualiserCompteursPanier() est alors appelée pour actualiser le compteur dans cet onglet.

   Attention : cet événement ne se déclenche pas dans la page qui a elle-même effectué la modification.
*/
window.addEventListener("storage", actualiserCompteursPanier);


/* ============================================================
   11. VIDER COMPLÈTEMENT LE PANIER
   ============================================================ */

/*
   Récupération du bouton HTML permettant de vider le panier.
   Son identifiant doit correspondre à id="vider-panier" dans panier.html.
*/
const boutonViderPanier = document.getElementById("vider-panier");


/*
   On vérifie que le bouton existe avant de lui associer un événement clic.
*/
if (boutonViderPanier) {

    // Écoute du clic sur le bouton Vider le panier.
    boutonViderPanier.addEventListener("click", function () {

        // Lecture du contenu actuel du panier.
        const panier = lirePanier();


        /*
           Si le panier ne contient aucun produit, on affiche un message et on arrête la fonction.
        */
        if (panier.length === 0) {

            alert("Ton panier est déjà vide.");

            return;
        }


        /*
           confirm() affiche une boîte de dialogue demandant une confirmation à l'utilisateur.

           La fonction retourne :
           - true si l'utilisateur confirme ;
           - false s'il annule.
        */
        const confirmation = confirm(
            "Veux-tu vraiment supprimer tous les articles du panier ?"
        );


        /*
           Le contenu du bloc if est exécuté uniquement si l'utilisateur a confirmé son choix.
        */
        if (confirmation) {

            /*
               On enregistre un tableau vide dans localStorage.
               Tous les produits sont ainsi supprimés du panier.
            */
            enregistrerPanier([]);


            // Mise à jour de l'affichage de la page panier.
            afficherPanier();


            // Remise à zéro du compteur dans la navigation.
            actualiserCompteursPanier();
        }
    });
}
