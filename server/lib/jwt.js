require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

function createToken(user) {
  const token = jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role, // Inclure le rôle de l'utilisateur
    },
    jwtSecret,
    {
      expiresIn: "24h",
      algorithm: "HS256",
    }
  );

  return token;
}

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    try {
      const user = jwt.verify(token, jwtSecret);
      resolve(user);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  createToken,
  verifyToken,
};
