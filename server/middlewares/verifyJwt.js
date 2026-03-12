const { verifyToken } = require("../lib/jwt");

const verifyJwt =
  (block = true) =>
  (req, res, next) => {
    const header = req.headers["authorization"] || req.headers["Authorization"];
    if (!header && block) {
      console.error("Authorization header missing");
      return res.sendStatus(401);
    }
    if (header) {
      const [type, token] = header.split(/\s+/);
      if (!/bearer/i.test(type)) {
        if (block) {
          console.error("Invalid token type");
          return res.sendStatus(401);
        }
        return next();
      }

      verifyToken(token)
        .then((user) => {
          req.user = user;
          next();
        })
        .catch((err) => {
          console.error("Token verification failed:", err);
          return block ? res.sendStatus(401) : next();
        });
    } else {
      next();
    }
  };

module.exports = verifyJwt;
