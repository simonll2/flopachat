# Audit du Code Applicatif — Flopachat

**Date :** 2026-03-12
**Périmètre :** Code applicatif uniquement (backend Express + frontend Vue.js)
**Méthode :** Analyse couche par couche, tous fichiers lus intégralement

---

## Couche 1 — Modèles Mongoose

**Verdict : Acceptable**

**Problèmes trouvés :**

| # | Fichier | Gravité | Description | Correction proposée |
|---|---------|---------|-------------|---------------------|
| 1 | `server/models/userModel.js` | Critique | Le champ `password` n'a pas `select: false`. Le hash du mot de passe est renvoyé dans toutes les réponses API (getUser, getAllUsers, etc.) | Ajouter `select: false` au champ password et utiliser `.select('+password')` uniquement dans le login |
| 2 | `server/models/userModel.js` | Moyen | Pas de `timestamps: true` — impossible de savoir quand un utilisateur a été créé/modifié | Ajouter `{ timestamps: true }` en option du schéma |
| 3 | `server/models/productModel.js` | Moyen | Aucune validation `min: 0` sur `price` et `stock` — des valeurs négatives sont acceptées | Ajouter `min: 0` sur les deux champs |
| 4 | `server/models/productModel.js` | Mineur | Pas de `timestamps: true` |  Ajouter l'option |
| 5 | `server/models/orderModel.js` | Mineur | `createdAt` est géré manuellement avec `default: Date.now` au lieu de `timestamps: true` — pas de `updatedAt` | Utiliser `timestamps: true` pour avoir les deux |
| 6 | `server/models/cartModel.js` | Moyen | Pas d'index unique sur `user` — rien n'empêche la création de plusieurs paniers par utilisateur au niveau du schéma | Ajouter `unique: true` sur le champ `user` |
| 7 | `server/models/cartModel.js` | Mineur | Pas d'index explicite sur `user` pour accélérer les requêtes `findOne({ user: ... })` | Ajouter `index: true` sur le champ `user` |
| 8 | `server/models/orderModel.js` | Mineur | Pas d'index sur `user` pour les requêtes `find({ user: ... })` | Ajouter `index: true` |
| 9 | `server/models/paymentModel.js` | Moyen | Aucune relation avec User ou Order — impossible de tracer quel utilisateur a fait quel paiement après coup | Ajouter un champ `user` avec ref à User |

**Points positifs :**
- Le pre-save hook pour le hashing bcrypt est correctement implémenté avec vérification `isModified`
- Les relations ObjectId avec `ref` sont cohérentes entre les modèles
- L'enum sur `role` (user/admin) et `status` (pending/completed/delivered) est bien défini
- Le champ `address` est correctement intégré (embedded document)

---

## Couche 2 — Bibliothèques utilitaires et configuration

**Verdict : Acceptable**

**Problèmes trouvés :**

| # | Fichier | Gravité | Description | Correction proposée |
|---|---------|---------|-------------|---------------------|
| 1 | `server/lib/jwt.js` | Moyen | L'expiration du token est de 7 jours — très longue pour une application e-commerce. Si un compte est compromis, l'attaquant a 7 jours d'accès | Réduire à 1-2h et implémenter un refresh token, ou au minimum réduire à 24h |
| 2 | `server/lib/jwt.js` | Mineur | `verifyToken` enveloppe `jwt.verify` synchrone dans une Promise inutile — `jwt.verify` sans callback est synchrone | Retourner directement le résultat ou utiliser le callback natif de jsonwebtoken |
| 3 | `server/lib/multerConfig.js` | Moyen | Le nommage des fichiers utilise `Date.now()` — collision possible si deux uploads arrivent à la même milliseconde | Utiliser `crypto.randomUUID()` ou ajouter un identifiant unique |
| 4 | `server/lib/multerConfig.js` | Mineur | Le message d'erreur pour un fichier invalide est une string brute `"Error: Images Only!"` au lieu d'un objet Error | Utiliser `cb(new Error("Images Only!"))` |

**Points positifs :**
- `mongo.js` : reconnexion automatique avec boucle retry et délai de 5 secondes — robuste
- `jwt.js` : algorithme HS256 explicitement spécifié (bonne pratique)
- `stripe.js` : clé lue depuis `process.env.STRIPE_SECRET_KEY` (pas de hardcoding)
- `multerConfig.js` : double vérification extension + MIME type, limite de taille à 10 Mo

---

## Couche 3 — Middlewares

**Verdict : Bon**

**Problèmes trouvés :**

| # | Fichier | Gravité | Description | Correction proposée |
|---|---------|---------|-------------|---------------------|
| 1 | `server/middlewares/verifyRole.js` | Moyen | Le rôle est vérifié depuis le token décodé (`req.user.role`) et non depuis la base de données. Si un admin est rétrogradé, son token reste valide avec le rôle admin pendant 7 jours | Pour les actions critiques (suppression, admin), vérifier le rôle en base. Ou réduire la durée du token |
| 2 | `server/middlewares/verifyJwt.js:12-15` | Mineur | Quand le header existe mais n'est pas de type Bearer en mode non-bloquant (`block=false`), le code tente quand même de vérifier le token (il passe au `verifyToken`) | Ajouter un `else if` ou un `return next()` quand le type n'est pas Bearer en mode non-bloquant |
| 3 | `server/middlewares/setUploadFolder.js` | Mineur | Les `console.log` de debug sont laissés en production (Original URL, Request Path, etc.) | Supprimer ou conditionner à `NODE_ENV === 'development'` |

**Points positifs :**
- `verifyJwt` supporte un mode non-bloquant (`block=false`) pour les routes mixtes (auth optionnelle) — design intelligent
- `setUploadFolder` crée le dossier automatiquement s'il n'existe pas (`mkdirSync` avec `recursive: true`)
- Pas de risque de path traversal : le dossier est construit avec `path.join(__dirname, ...)` et la valeur du sous-dossier est déterminée par le code, pas par l'utilisateur
- `verifyRole` accepte un tableau de rôles — extensible

---

## Couche 4 — Routes et Contrôleurs

**Verdict : Problématique**

**Problèmes trouvés :**

| # | Fichier | Gravité | Description | Correction proposée |
|---|---------|---------|-------------|---------------------|
| 1 | `server/controllers/userController.js:5` | **Critique** | Secret JWT hardcodé en fallback : `process.env.JWT_SECRET \|\| "jsonwebtokenexpressjsmongodbvuejsgroupe7boutiqueelectronique"`. Si la variable d'env n'est pas définie, le secret est prévisible | Supprimer le fallback. Faire crasher l'application si JWT_SECRET n'est pas défini |
| 2 | `server/controllers/userController.js:16` | **Critique** | `register()` lit `role` depuis `req.body` (ligne 16 : `const { email, password, role, ... } = req.body`). N'importe quel utilisateur peut s'enregistrer en tant qu'admin en envoyant `role: "admin"` | Supprimer `role` de la déstructuration, forcer `role: "user"` dans la création |
| 3 | `server/controllers/userController.js:56-67` | **Critique** | `getUser()` n'a aucun contrôle d'accès — un utilisateur authentifié peut voir le profil complet de n'importe quel autre utilisateur (y compris le hash du mot de passe, cf. Couche 1 #1) | Vérifier que `req.user._id === req.params.id` ou que l'utilisateur est admin |
| 4 | `server/controllers/userController.js:69-97` | **Critique** | `updateUser()` n'a aucun contrôle d'accès — un utilisateur authentifié peut modifier le profil de n'importe quel autre utilisateur | Vérifier que `req.user._id === req.params.id` ou que l'utilisateur est admin |
| 5 | `server/controllers/userController.js:76` | Moyen | `updateUser()` utilise `{ ...req.body }` directement dans `findByIdAndUpdate` — un utilisateur peut modifier son propre rôle en envoyant `role: "admin"` dans le body | Filtrer les champs autorisés (whitelist) avant mise à jour |
| 6 | `server/controllers/userController.js:160-168` | Moyen | `getAllUsers()` retourne tous les champs de tous les utilisateurs, y compris les hashs de mots de passe | Ajouter `.select('-password')` à la requête |
| 7 | `server/controllers/orderController.js:27-38` | Moyen | `getOrderById()` n'a aucun contrôle d'accès — un utilisateur authentifié peut voir les commandes de n'importe quel autre utilisateur | Vérifier que `order.user.equals(req.user._id)` ou que l'utilisateur est admin |
| 8 | `server/controllers/productController.js:116-117` | Moyen | `updateThumbs()` accepte la valeur absolue de thumbsUp/thumbsDown depuis le client au lieu d'incrémenter côté serveur. Un utilisateur malveillant peut envoyer `{ thumbsUp: 999999 }` | Utiliser `$inc: { thumbsUp: 1 }` ou `$inc: { thumbsDown: 1 }` côté serveur |
| 9 | `server/controllers/cartController.js:28-63` | Moyen | Pas d'atomicité sur la gestion du stock — en cas de requêtes concurrentes, le stock peut devenir négatif (race condition) | Utiliser `findOneAndUpdate` avec `$inc` et une condition `{ stock: { $gte: quantity } }` |
| 10 | `server/controllers/userController.js:119-144` | Mineur | `validateToken()` utilise `jwt.verify` directement avec le secret hardcodé au lieu d'utiliser la fonction `verifyToken` de `lib/jwt.js` — incohérence | Utiliser `verifyToken` de la lib |
| 11 | Tous les contrôleurs | Moyen | Aucune validation des entrées (`req.body`) avec une librairie de validation (Joi, express-validator, etc.) — les données sont utilisées directement | Ajouter une couche de validation, au minimum sur les routes register, login, et update |

**Points positifs :**
- Toutes les routes admin sont protégées par `verifyJwt()` + `verifyRole(["admin"])`
- Les routes du panier utilisent systématiquement `req.user._id` pour l'isolation des données
- `confirmOrder()` implémente une idempotence avec le modèle PaymentModel (protection contre le double traitement)
- `createCheckoutSession()` re-lit les prix depuis la base de données au lieu de faire confiance au client — excellente pratique de sécurité
- Try/catch systématique dans tous les contrôleurs avec codes HTTP appropriés
- Cohérence REST globalement respectée (GET/POST/PUT/DELETE/PATCH)

---

## Couche 5 — Point d'entrée et seed

**Verdict : Acceptable**

**Problèmes trouvés :**

| # | Fichier | Gravité | Description | Correction proposée |
|---|---------|---------|-------------|---------------------|
| 1 | `server/server.js:82` | Mineur | Le port est hardcodé à 5000 au lieu d'utiliser `process.env.PORT \|\| 5000` | Rendre le port configurable |
| 2 | `server/server.js` | Moyen | Pas de middleware global de gestion d'erreurs (`app.use((err, req, res, next) => ...)`) — les erreurs non rattrapées par les try/catch des contrôleurs tombent dans le silence | Ajouter un error handler Express à la fin de la chaîne de middlewares |
| 3 | `server/server.js:52-72` | Mineur | Le proxy stats-service n'a pas de timeout — si le service stats est lent, les requêtes restent bloquées indéfiniment | Ajouter un `timeout` à la requête axios |
| 4 | `server/seed.js:330` | Moyen | `products.sort(() => 0.5 - Math.random())` mute le tableau original `products` à chaque itération de la boucle — cela affecte les itérations suivantes et rend le calcul du total potentiellement incohérent | Utiliser `[...products].sort(...)` pour travailler sur une copie |
| 5 | `server/seed.js:320-322` | Mineur | `User.insertMany([admin])` pour un seul document — `admin.save()` serait plus simple et déclencherait le pre-save hook (bien que le hash soit fait manuellement) | Utiliser `admin.save()` |

**Points positifs :**
- L'ordre des middlewares est correct : CORS → JSON parser → Static files → Routes
- Le seed est idempotent : il vérifie `userCount === 0 && productCount === 0` avant d'insérer
- Les mots de passe du seed sont hashés manuellement avec `bcrypt.hash()` (correct car `insertMany` ne déclenche pas les hooks pre-save)
- Le seed génère des données réalistes et variées (11 utilisateurs, 12 produits, commandes aléatoires avec distribution de statuts réaliste 60/30/10)
- La copie des fichiers statiques par défaut au démarrage est une bonne gestion du PVC Kubernetes

---

## Couche 6 — Frontend : Architecture et configuration

**Verdict : Acceptable**

**Problèmes trouvés :**

| # | Fichier | Gravité | Description | Correction proposée |
|---|---------|---------|-------------|---------------------|
| 1 | `front/src/store/plugins/persistState.js` | **Critique** | L'intégralité du state Vuex (y compris le token JWT) est stockée dans `localStorage`. En cas de vulnérabilité XSS, le token est immédiatement accessible via `localStorage.getItem('store')` | Stocker le token dans un cookie `HttpOnly` + `Secure` + `SameSite=Strict`, ou au minimum ne persister que les données non sensibles |
| 2 | `front/src/router/index.js` | Moyen | Aucun lazy loading — toutes les vues sont importées statiquement. Le bundle inclut tout le code admin même pour les utilisateurs normaux | Utiliser `() => import('../views/...')` pour les vues admin et les vues secondaires |
| 3 | `front/src/router/index.js:62` | Mineur | La route "Payment" n'est pas dans la liste `protectedRoutes` — un utilisateur non authentifié peut accéder à la page de paiement | Ajouter "Payment" à la liste des routes protégées |

**Points positifs :**
- Validation du token au démarrage de l'app (`dispatch("auth/validateToken")`) avant le montage — bonne UX
- Routes admin protégées par `beforeEnter` qui vérifie `isAuthenticated` ET `isAdmin`
- Routes utilisateur protégées par `beforeEach` global
- Modules Vuex bien structurés avec `namespaced: true`

---

## Couche 7 — Frontend : Store Vuex

**Verdict : Acceptable**

**Problèmes trouvés :**

| # | Fichier | Gravité | Description | Correction proposée |
|---|---------|---------|-------------|---------------------|
| 1 | `front/src/store/product.js:50` | **Critique** | L'action `updateProductThumbs` fait un `commit("UPDATE_PRODUCT_THUMBS", ...)` mais cette mutation **n'existe pas** dans le module. Les mutations définies sont SET_PRODUCTS, SET_PRODUCT, SET_USER_VOTED_PRODUCTS, ADD_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT. Cela provoque une erreur silencieuse à l'exécution | Soit renommer le commit en `UPDATE_PRODUCT`, soit créer la mutation `UPDATE_PRODUCT_THUMBS` |
| 2 | `front/src/store/auth.js` | Moyen | Le `logout` fait un `dispatch("resetState")` root mais ne supprime pas le token de `localStorage` explicitement — `persistState` le re-stocke immédiatement avec le state vidé, mais si le timing est mauvais, le token peut persister | Ajouter `localStorage.removeItem('token')` et `localStorage.removeItem('store')` dans l'action logout |
| 3 | `front/src/store/cart.js:76-83` | Mineur | L'action `checkout` convertit les prix en centimes (`price * 100`) côté client, mais le serveur re-lit les prix depuis la DB et refait la conversion. La conversion client est donc inutile et potentiellement source de confusion | Supprimer la conversion côté client, envoyer uniquement productId et quantity |

**Points positifs :**
- Bonne séparation state/getters/mutations/actions dans tous les modules
- Les appels API sont dans les actions (pas dans les mutations)
- Le panier est synchronisé avec le backend (fetchCart après chaque modification)
- Gestion correcte du login : set token → fetchUserProfile
- Actions admin (fetchUsers, fetchAllOrdersForAdmin) regroupées dans `loadAdminData`

---

## Couche 8 — Frontend : Services API

**Verdict : Problématique**

**Problèmes trouvés :**

| # | Fichier | Gravité | Description | Correction proposée |
|---|---------|---------|-------------|---------------------|
| 1 | Tous les services | Moyen | Pas d'instance axios centralisée — chaque service injecte manuellement le token via `getToken()` dans chaque méthode. Duplication massive de code (~40 occurrences de `headers: { Authorization: \`Bearer ${token}\` }`) | Créer une instance axios avec un intercepteur request qui injecte le token automatiquement |
| 2 | Tous les services | Moyen | Pas d'intercepteur axios pour les erreurs globales — si le serveur renvoie 401 (token expiré), chaque composant doit gérer individuellement la redirection vers /login | Ajouter un intercepteur response qui redirige vers /login sur 401 |
| 3 | `front/src/services/paymentService.js:5-7` | Moyen | Clé publique Stripe hardcodée dans le code source au lieu d'utiliser une variable d'environnement (`VUE_APP_STRIPE_KEY`) | Utiliser `process.env.VUE_APP_STRIPE_PUBLIC_KEY` |
| 4 | `front/src/services/statsService.js` | Mineur | Implémenté avec une structure correcte et un `getHeaders()` centralisé, mais utilise un pattern différent des autres services (méthode getHeaders vs inline) — incohérence | Harmoniser tous les services sur le même pattern (idéalement avec un intercepteur) |

**Points positifs :**
- Tous les services utilisent le même `API_URL = "/api"` (pas d'URL hardcodée absolue)
- La fonction `getToken()` est centralisée dans `utils/auth.js`
- `statsService.js` est implémenté et fonctionnel (pas vide)
- Cohérence des endpoints avec les routes backend

---

## Couche 9 — Frontend : Composants critiques

**Verdict : Acceptable**

**Problèmes trouvés :**

| # | Fichier | Gravité | Description | Correction proposée |
|---|---------|---------|-------------|---------------------|
| 1 | `front/src/components/Payment/Payment.vue` | **Critique** | Composant non fonctionnel — données hardcodées (`items: [{ name: "Product 1", ... }]`) et référence à un module Vuex `"payment"` qui n'existe pas (`mapActions("payment", [...])`) | Ce composant est un placeholder abandonné. Le vrai checkout passe par `Cart.vue` → `cart.checkout()`. Supprimer ce composant ou le compléter |
| 2 | `front/src/components/Auth/Register.vue` | Moyen | Aucune validation de la force du mot de passe côté client — un mot de passe d'un seul caractère est accepté | Ajouter une validation `minlength="8"` et/ou une vérification JavaScript |
| 3 | `front/src/components/Auth/Login.vue:46` | Mineur | `console.log("Component response (login):", response)` laissé en production — fuite potentielle d'information dans la console | Supprimer les console.log de debug |
| 4 | `front/src/components/Products/ProductList.vue:43` | Mineur | `this.$store.commit("product/UPDATE_PRODUCT", updatedProduct)` — commit direct sur le store au lieu de passer par une action. Casse le pattern Vuex (les composants ne devraient pas committer directement) | Créer une action wrapper ou utiliser mapMutations |
| 5 | `front/src/components/Admin/Dashboard.vue:129` | Mineur | L'axe Y du graphique a un `max: 30` hardcodé — si le nombre de commandes par mois dépasse 30, le graphique est tronqué | Calculer dynamiquement le max ou supprimer la limite |

**Points positifs :**
- Login et Register utilisent correctement `mapActions` et `mapGetters`
- Register gère bien l'erreur 409 (email déjà utilisé) avec un message clair
- Cart.vue affiche un état vide propre avec une icône
- Dashboard.vue calcule dynamiquement les stats sur 12 mois avec une bonne logique de filtrage
- ProductList.vue vérifie `isAuthenticated` avant de charger les votes utilisateur

---

## Couche 10 — Frontend : Layouts et navigation

**Verdict : Bon**

**Problèmes trouvés :**

| # | Fichier | Gravité | Description | Correction proposée |
|---|---------|---------|-------------|---------------------|
| 1 | `front/src/components/NavBar/NavBar.vue:171` | Moyen | Event listener `document.addEventListener("click", handleOutsideClick)` ajouté dans `onMounted` mais jamais supprimé dans `onUnmounted` — fuite mémoire | Ajouter `onUnmounted(() => document.removeEventListener("click", handleOutsideClick))` |
| 2 | `front/src/components/NavBar/NavBar.vue` | Mineur | Mélange Options API (`computed`, `methods`, `watch`) et Composition API (`setup()`) dans le même composant — crée de la confusion | Migrer entièrement vers la Composition API ou rester en Options API |
| 3 | `front/src/layouts/AdminLayout.vue` | Mineur | La navbar admin est `fixed-top` (90px) mais le `<main>` a seulement `padding: 20px` — le contenu est partiellement masqué par la navbar | Ajouter `padding-top: 110px` comme dans DefaultLayout |
| 4 | `front/src/components/FooterBar/FooterBar.vue:8` | Mineur | Copyright hardcodé à 2024 — devrait être dynamique | Utiliser `new Date().getFullYear()` |

**Points positifs :**
- Le layout admin est protégé au niveau du routeur (`beforeEnter` vérifie isAdmin)
- La navigation reflète correctement l'état d'authentification (dropdown login/register vs logout)
- Le cart badge avec animation (scale up/down) est un bon détail UX
- La recherche avec dropdown autocomplete est bien implémentée
- Structure HTML cohérente avec Bootstrap dans tous les composants

---

## SYNTHESE GLOBALE

### 1. Score qualité estimé : **11/20**

Le code est fonctionnel et montre une bonne compréhension des frameworks utilisés. Cependant, les failles de sécurité critiques (élévation de privilèges, IDOR, fuite de données) et le manque de validation des entrées tirent significativement la note vers le bas. Pour un projet d'école, la structure est cohérente et l'architecture est saine, mais un correcteur exigeant ne pardonnera pas les failles de sécurité flagrantes.

### 2. Top 5 des problèmes les plus graves

| # | Problème | Fichier | Impact |
|---|---------|---------|--------|
| 1 | **Élévation de privilèges via register** — n'importe qui peut s'inscrire en admin en envoyant `role: "admin"` | `server/controllers/userController.js:16` | Un attaquant prend le contrôle total de l'application |
| 2 | **IDOR sur getUser et updateUser** — un utilisateur peut lire/modifier le profil de n'importe quel autre utilisateur | `server/controllers/userController.js:56-97` | Vol de données personnelles, modification de comptes tiers |
| 3 | **Secret JWT hardcodé en fallback** — si la variable d'environnement manque, le secret est public | `server/controllers/userController.js:5` | Forgery de tokens, usurpation d'identité |
| 4 | **Mot de passe exposé dans les réponses API** — `select: false` absent sur le champ password | `server/models/userModel.js` + `getAllUsers` | Fuite des hashs de mots de passe à tout utilisateur authentifié |
| 5 | **Token JWT stocké en localStorage** — vulnérable au XSS | `front/src/store/plugins/persistState.js` | Vol de session si une faille XSS est exploitée |

### 3. Top 5 des points forts

| # | Point fort | Détail |
|---|-----------|--------|
| 1 | **Prix relus depuis la DB dans createCheckoutSession** | Le serveur ne fait pas confiance au client pour les prix — excellente pratique de sécurité e-commerce |
| 2 | **Idempotence de confirmOrder** | Le modèle PaymentModel empêche le double traitement d'un paiement — protection critique pour l'intégrité des commandes |
| 3 | **Seed idempotent avec données réalistes** | Le seed vérifie si la base est vide, génère des données variées avec une distribution réaliste des statuts |
| 4 | **Architecture frontend bien structurée** | Séparation propre layouts/views/components/store/services, modules Vuex namespaced, routes protégées |
| 5 | **Gestion du stock intégrée au panier** | Le stock est décrémenté à l'ajout au panier et restauré à la suppression — logique métier cohérente |

### 4. Liste d'implémentation priorisée (corrections par impact sur la note)

**Priorité 1 — Corrections critiques (impact fort, effort faible) :**

1. **Supprimer `role` de la déstructuration dans `register()`** — 1 ligne à modifier
   ```js
   // Avant
   const { email, password, role, firstName, lastName, address } = req.body;
   // Après
   const { email, password, firstName, lastName, address } = req.body;
   // Et forcer role: "user" dans new User({...})
   ```

2. **Ajouter `select: false` au mot de passe** dans `userModel.js`
   ```js
   password: { type: String, required: true, select: false }
   ```
   Et dans login : `User.findOne({ email }).select('+password')`

3. **Supprimer le fallback du secret JWT** dans `userController.js:5` — supprimer le `|| "..."`

4. **Ajouter le contrôle d'accès à getUser et updateUser** — vérifier `req.user._id == req.params.id || req.user.role === 'admin'`

5. **Ajouter le contrôle d'accès à getOrderById** — vérifier `order.user.equals(req.user._id)`

**Priorité 2 — Améliorations de sécurité (impact moyen) :**

6. **Filtrer les champs dans updateUser** — whitelist des champs modifiables (pas de `role`)
7. **Utiliser `$inc` dans updateThumbs** au lieu d'accepter une valeur absolue du client
8. **Créer une instance axios centralisée** avec intercepteur pour le token et la gestion des 401
9. **Ajouter une validation des entrées** avec Joi ou express-validator (au minimum register/login)
10. **Réduire la durée du token JWT** à 24h maximum

**Priorité 3 — Qualité de code (impact cosmétique) :**

11. Supprimer les `console.log` de debug en production
12. Ajouter `timestamps: true` aux modèles qui n'en ont pas
13. Ajouter `min: 0` sur price et stock dans productModel
14. Corriger la mutation manquante `UPDATE_PRODUCT_THUMBS` dans le store product
15. Supprimer ou compléter le composant `Payment.vue` (placeholder non fonctionnel)
16. Ajouter un error handler global Express
17. Lazy-loading des routes admin dans le router
18. Corriger la fuite mémoire (event listener) dans NavBar.vue
