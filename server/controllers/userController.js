const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { createToken, verifyToken } = require("../lib/jwt");
const upload = require("../lib/multerConfig");
const path = require("path");
const fs = require("fs");

const register = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ msg: err });
    }
    try {
      const { email, password, firstName, lastName, address } = req.body;
      let user = await User.findOne({ email });
      if (!user) {
        user = new User({
          email,
          password,
          role: "user",
          firstName,
          lastName,
          address,
          imagePath: req.file ? `/static/users/${req.file.filename}` : `/static/users/default-user.jpg`, // Utiliser l'image par défaut si aucune image n'est uploadée
        });
        await user.save();
        return res.status(201).json(user);
      } else {
        return res.status(409).json({ error: "User already exists" });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
};

const login = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.json({ token: await createToken(user) });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUser = async (req, res) => {
  try {
    // Access control: user can only view their own profile, unless admin
    if (req.user._id.toString() !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateUser = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ msg: err });
    }
    try {
      const userId = req.params.id;

      // Access control: user can only update their own profile, unless admin
      if (req.user._id.toString() !== userId && req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Whitelist allowed fields to prevent role escalation
      const allowedFields = ["email", "password", "firstName", "lastName", "address", "imagePath"];
      let updatedUserData = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) {
          updatedUserData[key] = req.body[key];
        }
      }

      if (req.file) {
        updatedUserData.imagePath = `/static/users/${req.file.filename}`;
      } else if (!req.body.imagePath) {
        // Si l'utilisateur n'a pas de chemin d'image dans le corps de la requête et n'a pas uploadé de nouvelle image, utilisez l'image par défaut
        updatedUserData.imagePath = "/static/users/default-user.jpg";
      }

      const user = await User.findByIdAndUpdate(userId, updatedUserData, {
        new: true,
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Permettre la suppression si l'utilisateur est admin ou s'il essaie de supprimer son propre compte
    if (req.user.role !== "admin" && req.user._id.toString() !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const validateToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    // Vérifier le token en utilisant la fonction centralisée
    const decoded = await verifyToken(token);
    const userId = decoded._id;

    // Rechercher l'utilisateur dans la base de données
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Répondre avec les informations utilisateur
    res.json({ user });
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

const getVotedProducts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("votedProducts");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user.votedProducts);
  } catch (error) {
    console.error("Error fetching voted products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
  getUser,
  updateUser,
  deleteUser,
  validateToken,
  getVotedProducts,
  getAllUsers,
};
