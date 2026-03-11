const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getUser,
  updateUser,
  deleteUser,
  validateToken,
  getVotedProducts,
  getAllUsers, // Importer le nouveau contrôleur
} = require("../controllers/userController");
const verifyJwt = require("../middlewares/verifyJwt");
const verifyRole = require("../middlewares/verifyRole");
const setUploadFolder = require("../middlewares/setUploadFolder");

router.use(express.json());

// Nouvelle route pour obtenir les produits votés par l'utilisateur
router.get("/users/voted-products", verifyJwt(), getVotedProducts);

// Routes accessibles par les utilisateurs connectés
router.get("/users/:id", verifyJwt(), getUser);
router.put("/users/:id", verifyJwt(), setUploadFolder, updateUser);

// Route pour récupérer tous les utilisateurs (uniquement pour les administrateurs)
router.get("/admin/users", verifyJwt(), verifyRole(["admin"]), getAllUsers);

// Routes accessibles uniquement par les administrateurs
router.delete("/admin/users/:id", verifyJwt(), verifyRole(["admin"]), deleteUser);

router.post("/login", login);
router.post("/register", setUploadFolder, register);

// Route pour valider le token
router.post("/validate-token", validateToken);

module.exports = router;
