const verifyRole = (roles) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    console.error("User role missing in request");
    return res.status(403).json({ error: "Forbidden" });
  }

  if (!roles.includes(req.user.role)) {
    console.error(`User role '${req.user.role}' not authorized`);
    return res.status(403).json({ error: "Forbidden" });
  }

  next();
};

module.exports = verifyRole;
