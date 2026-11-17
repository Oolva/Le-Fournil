
/* ============================================================
   1. CONFIGURATION DU PANIER
   ============================================================ */

/*
   Déclaration d'une constante avec const.
   Elle contient le nom de la clé utilisée pour enregistrer le panier dans le stockage local du navigateur (localStorage).

   Cette clé doit être identique à celle utilisée dans panier.js pour que les deux fichiers accèdent au même panier.
*/
const CLE_PANIER = "panierLeFournil";


/* ============================================================
   2. FONCTIONS UTILITAIRES
   ============================================================ */

/*
   Cette fonction permet de récupérer le contenu du panier.

   localStorage.getItem() lit une donnée enregistrée dans le navigateur à partir de sa clé.

   JSON.parse() transforme le texte JSON récupéré en tableau JavaScript exploitable.

   Si aucun panier n'existe encore, || "[]" fournit un tableau vide par défaut.
*/
function lirePanierCommande() {
    return JSON.parse(localStorage.getItem(CLE_PANIER) || "[]");
}


/*
   Cette fonction formate un prix pour l'afficher correctement au format français et en euros.

   toLocaleString() adapte l'affichage selon une langue et des conventions régionales.

   Exemple : 12.5 devient 12,50 €.
*/
function formaterPrixCommande(prix) {
    return prix.toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR"
    });
}


/* ============================================================
   3. RÉCUPÉRATION DES ÉLÉMENTS HTML
   ============================================================ */

/*
   document.getElementById() permet de récupérer un élément HTML grâce à son attribut id.

   Ces variables établissent le lien entre JavaScript et les éléments présents dans commande.html.
*/

// Formulaire contenant les coordonnées du client et le retrait.
const formulaire = document.getElementById("formulaire-commande");

// Section affichant le récapitulatif avant confirmation.
const recapitulatif = document.getElementById("recapitulatif-commande");

// Section affichant le message de confirmation finale.
const confirmationFinale = document.getElementById("confirmation-finale");

// Zones dans lesquelles seront affichées les informations.
const detailsClient = document.getElementById("details-client");
const detailsProduits = document.getElementById("details-produits");
const totalCommande = document.getElementById("total-commande");

// Boutons permettant de confirmer ou de modifier la commande.
const boutonConfirmer = document.getElementById("confirmer-commande");
const boutonModifier = document.getElementById("modifier-commande");


/*
   let permet de déclarer une variable dont la valeur pourra être modifiée pendant l'exécution du programme.

   Cette variable contiendra les informations de la commande une fois que le client aura validé le formulaire.

   null signifie qu'aucune commande n'a encore été préparée.
*/
let commandeEnCours = null;


/* ============================================================
   4. VÉRIFICATION DE LA DATE DE RETRAIT
   ============================================================ */

/*
   On récupère le champ HTML permettant de choisir la date de retrait de la commande.
*/
const champDate = document.getElementById("date-retrait");

/*
   if permet de vérifier une condition.
   Ici, on vérifie que le champ existe bien dans le document HTML avant de manipuler ses propriétés.
*/
if (champDate) {

    /*
       new Date() récupère la date actuelle de l'ordinateur.
       Cette date est ensuite décomposée en année, mois et jour.
    */
    const aujourdHui = new Date();

    const annee = aujourdHui.getFullYear();

    /*
       getMonth() retourne un mois compris entre 0 et 11.
       On ajoute donc 1 pour obtenir le mois réel.

       padStart(2, "0") ajoute un zéro devant les nombres qui ne comportent qu'un seul chiffre.
       Exemple : 3 devient 03.
    */
    const mois = String(aujourdHui.getMonth() + 1).padStart(2, "0");

    const jour = String(aujourdHui.getDate()).padStart(2, "0");

    /*
       On construit une date au format AAAA-MM-JJ.
       Cette valeur est affectée à la propriété min du champ date.

       Le navigateur empêchera ainsi de sélectionner une date antérieure à aujourd'hui dans ce formulaire.
    */
    champDate.min = `${annee}-${mois}-${jour}`;
}


/* ============================================================
   5. PRÉPARATION DU RÉCAPITULATIF DE COMMANDE
   ============================================================ */

/*
   addEventListener() permet d'écouter un événement.
   Ici, on surveille l'événement submit du formulaire.

   L'événement submit se déclenche lorsque le client clique sur le bouton de validation du formulaire.
*/
if (formulaire) {

    formulaire.addEventListener("submit", function (event) {

        /*
           preventDefault() empêche le comportement normal du formulaire HTML.

           Sans cette instruction, le navigateur pourrait recharger la page lors de l'envoi du formulaire.
        */
        event.preventDefault();


        /*
           On récupère le panier enregistré dans localStorage.
           Le contenu sera utilisé pour préparer la commande.
        */
        const panier = lirePanierCommande();


        /*
           length permet de connaître le nombre d'éléments présents dans un tableau.

           Si le panier est vide, on affiche un message puis on redirige le client vers la page carte.html.
        */
        if (panier.length === 0) {

            alert("Votre panier est vide. Ajoutez des produits avant de commander.");

            // Redirection vers la page présentant les produits.
            window.location.href = "carte.html";

            /*
               return arrête immédiatement l'exécution de la fonction pour éviter de continuer le traitement.
            */
            return;
        }


        /*
           FormData récupère automatiquement les valeurs saisies dans les champs du formulaire.

           Les champs sont identifiés grâce à leur attribut name dans le code HTML.
        */
        const donnees = new FormData(formulaire);


        /*
           On crée un objet JavaScript qui rassemble toutes les informations de la commande.

           Un objet regroupe plusieurs propriétés sous la forme clé : valeur.

           donnees.get() récupère la valeur d'un champ à partir de son attribut name.

           map() parcourt le tableau des produits.
           { ...produit } utilise l'opérateur spread pour créer une copie de chaque objet produit.
        */
        commandeEnCours = {
            prenom: donnees.get("prenom"),
            nom: donnees.get("nom"),
            email: donnees.get("email"),
            telephone: donnees.get("telephone"),
            dateRetrait: donnees.get("date-retrait"),
            heureRetrait: donnees.get("heure-retrait"),
            produits: panier.map(produit => ({ ...produit }))
        };


        /*
           Appel de la fonction qui construit et affiche le récapitulatif des informations et des produits.
        */
        afficherRecapitulatif(commandeEnCours);


        /*
           On masque le formulaire et on affiche le récapitulatif.

           hidden est une propriété HTML qui permet de masquer un élément sans le supprimer du document.
        */
        formulaire.hidden = true;
        recapitulatif.hidden = false;


        /*
           scrollIntoView() fait défiler automatiquement la page jusqu'à l'élément ciblé.

           behavior: smooth active un défilement fluide.
           block: start positionne l'élément en haut de la zone visible.
        */
        recapitulatif.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}


/* ============================================================
   6. FONCTION D'AFFICHAGE DU RÉCAPITULATIF
   ============================================================ */

/*
   Cette fonction reçoit un paramètre appelé commande.

   Elle utilise les informations contenues dans cet objet pour afficher les coordonnées du client, 
   les produits commandés et le montant total.
*/
function afficherRecapitulatif(commande) {

    /*
       replaceChildren() supprime tous les éléments enfants présents dans les deux zones HTML.

       Cela évite d'accumuler plusieurs fois les informations si le récapitulatif est généré de nouveau.
    */
    detailsClient.replaceChildren();
    detailsProduits.replaceChildren();


    /*
       On crée un tableau contenant les informations du client.

       Les accents graves ` permettent d'utiliser les templates literals : 
       on peut insérer des variables directement dans une chaîne avec ${...}.
    */
    const informations = [
        `Client : ${commande.prenom} ${commande.nom}`,
        `E-mail : ${commande.email}`,
        `Téléphone : ${commande.telephone}`,
        `Date de retrait : ${commande.dateRetrait}`,
        `Créneau souhaité : ${commande.heureRetrait}`
    ];


    /*
       forEach() parcourt chaque élément du tableau informations.

       Pour chaque texte :
       - createElement("p") crée une balise paragraphe.
       - textContent insère le texte dans cette balise.
       - appendChild() ajoute le paragraphe dans la page HTML.
    */
    informations.forEach(texte => {

        const paragraphe = document.createElement("p");

        paragraphe.textContent = texte;

        detailsClient.appendChild(paragraphe);
    });


    /*
       Initialisation du montant total.
       On commence à zéro avant de calculer le prix des produits.
    */
    let total = 0;


    /*
       On parcourt tous les produits de la commande.

       Pour chaque produit :
       - on crée une ligne d'affichage ;
       - on calcule son sous-total ;
       - on affiche son nom, sa quantité et son prix ;
       - on ajoute son sous-total au montant global.
    */
    commande.produits.forEach(produit => {

        // Création d'un paragraphe pour présenter le produit.
        const ligne = document.createElement("p");

        /*
           Calcul du sous-total :
           prix unitaire multiplié par quantité commandée.
        */
        const sousTotal = produit.prix * produit.quantite;


        /*
           textContent ajoute le texte dans le paragraphe.
           Le prix est converti au format français grâce à la fonction formaterPrixCommande().
        */
        ligne.textContent =
            `${produit.nom} × ${produit.quantite} : ` +
            formaterPrixCommande(sousTotal);


        // Ajout de la ligne dans la zone des produits.
        detailsProduits.appendChild(ligne);

        // Addition du sous-total au montant global.
        total += sousTotal;
    });


    /*
       Affichage du montant total dans la page HTML.
       textContent modifie le texte de l'élément ciblé.
    */
    totalCommande.textContent = formaterPrixCommande(total);
}


/* ============================================================
   7. RETOUR AU FORMULAIRE POUR MODIFICATION
   ============================================================ */

/*
   On vérifie que le bouton de modification existe.
   S'il existe, on lui associe un événement click.
*/
if (boutonModifier) {

    boutonModifier.addEventListener("click", function () {

        /*
           On masque le récapitulatif et on réaffiche le formulaire afin que le client puisse corriger
           ses informations avant la confirmation.
        */
        recapitulatif.hidden = true;
        formulaire.hidden = false;


        /*
           Défilement fluide vers le formulaire pour que le client puisse le retrouver facilement.
        */
        formulaire.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}


/* ============================================================
   8. FORMATAGE DE LA DATE DE RETRAIT
   ============================================================ */

/*
   Cette fonction transforme une date au format AAAA-MM-JJ en date au format français JJ/MM/AAAA.

   Exemple :
   2026-11-25 devient 25/11/2026.
*/
function formaterDateCommande(date) {

    /*
       Si aucune date n'est fournie, on retourne une chaîne vide.
       return arrête l'exécution de la fonction.
    */
    if (!date) return "";


    /*
       split("-") découpe la chaîne de caractères à chaque tiret et crée un tableau.

       Exemple :
       "2026-11-25" devient ["2026", "11", "25"].
    */
    const [annee, mois, jour] = date.split("-");


    /*
       On recompose la date dans l'ordre français :
       jour, mois, année.
    */
    return `${jour}/${mois}/${annee}`;
}


/* ============================================================
   9. CONFIRMATION DE LA COMMANDE DE DÉMONSTRATION
   ============================================================ */

/*
   On vérifie que le bouton de confirmation existe avant de lui associer un événement.
*/
if (boutonConfirmer) {

    boutonConfirmer.addEventListener("click", function () {

        /*
           Si aucune commande n'a été préparée, on arrête la fonction.

           ! signifie "non" ou "négation".
           !commandeEnCours signifie donc qu'aucune commande n'est actuellement disponible.
        */
        if (!commandeEnCours) return;


        /*
           On relit le panier pour vérifier qu'il contient toujours des produits au moment de la confirmation.
        */
        const panierActuel = lirePanierCommande();


        /*
           Si le panier est vide, on affiche un message et on redirige le client vers la carte des produits.
        */
        if (panierActuel.length === 0) {

            alert("Le panier est vide. Veuillez recommencer.");

            window.location.href = "carte.html";

            return;
        }


        /*
           Création d'un numéro de commande de démonstration.

           Date.now() retourne le nombre de millisecondes écoulées depuis le 1er janvier 1970.

           toString() transforme ce nombre en texte.
           slice(-8) récupère les huit derniers caractères.

           Le préfixe DEMO- indique qu'il s'agit d'une commande fictive et non d'une véritable commande.
        */
        const numeroCommande =
            "DEMO-" + Date.now().toString().slice(-8);


        /*
           Affichage du numéro de commande dans le HTML.
           getElementById() récupère l'élément concerné.
           textContent modifie son contenu textuel.
        */
        document.getElementById("numero-commande").textContent =
            numeroCommande;


        /*
           Affichage de la date de retrait.
           On utilise la fonction créée précédemment pour présenter la date au format français.
        */
        document.getElementById("date-confirmation").textContent =
            formaterDateCommande(commandeEnCours.dateRetrait);


        // Affichage du créneau horaire choisi par le client.
        document.getElementById("heure-confirmation").textContent =
            commandeEnCours.heureRetrait;


        /*
           Récupération du conteneur HTML qui affichera la liste des produits dans la confirmation finale.
        */
        const listeProduits =
            document.getElementById("produits-confirmation");


        /*
           On vide le contenu précédent de la liste pour éviter de répéter les produits.
        */
        listeProduits.replaceChildren();


        // Initialisation du montant total de la commande.
        let total = 0;


        /*
           Parcours des produits de la commande.
           Pour chacun, on crée une ligne avec :
           - le nom et la quantité ;
           - le prix correspondant.
        */
        commandeEnCours.produits.forEach(function (produit) {

            // Création d'une ligne de présentation.
            const ligne = document.createElement("p");


            // Calcul du sous-total du produit.
            const sousTotal = produit.prix * produit.quantite;


            /*
               Création d'une balise span pour afficher le nom et la quantité du produit.
            */
            const nom = document.createElement("span");

            nom.textContent =
                `${produit.nom} × ${produit.quantite}`;


            /*
               Création d'une balise strong pour mettre le prix en évidence.
            */
            const prix = document.createElement("strong");

            prix.textContent = formaterPrixCommande(sousTotal);


            /*
               append() ajoute plusieurs éléments HTML à la suite dans le même élément parent.
               Ici, on ajoute le nom puis le prix dans la ligne.
            */
            ligne.append(nom, prix);


            // Ajout de la ligne complète dans la liste des produits.
            listeProduits.appendChild(ligne);


            // Addition du sous-total au montant total.
            total += sousTotal;
        });


        /*
           Affichage du montant total dans la confirmation finale.
        */
        document.getElementById("total-confirmation").textContent =
            formaterPrixCommande(total);


        /*
           Création du message de remerciement personnalisé.
           Le prénom du client est récupéré dans commandeEnCours.
        */
        document.getElementById("message-confirmation").textContent =
            `Merci ${commandeEnCours.prenom} ! Votre commande de démonstration a été confirmée.`;


        /* ----------------------------------------------------
           10. VIDAGE DU PANIER APRÈS CONFIRMATION
           ---------------------------------------------------- */

        /*
           localStorage.setItem() permet d'enregistrer une donnée dans le stockage local du navigateur.

           JSON.stringify([]) transforme un tableau vide en texte JSON.

           Le panier est donc réinitialisé après la confirmation.
           Cette opération évite que les mêmes produits restent dans le panier après la commande de démonstration.
        */
        localStorage.setItem(CLE_PANIER, JSON.stringify([]));


        /* ----------------------------------------------------
           11. AFFICHAGE DE LA CONFIRMATION FINALE
           ---------------------------------------------------- */

        /*
           On masque les étapes précédentes :
           - le formulaire de commande ;
           - le récapitulatif.

           On affiche uniquement la confirmation finale.
        */
        confirmationFinale.hidden = false;
        recapitulatif.hidden = true;
        formulaire.hidden = true;


        /*
           Défilement fluide jusqu'à la confirmation finale pour que le client voie immédiatement le résultat.
        */
        confirmationFinale.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}
