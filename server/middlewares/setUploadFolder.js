const path = require("path");
const fs = require("fs");

const setUploadFolder = (req, res, next) => {
  let folder = "others";
  console.log(`Original URL: ${req.originalUrl}`);
  console.log(`Request Path: ${req.path}`);
  console.log(`Request Method: ${req.method}`);

  if (req.originalUrl.includes("/register") || req.path.includes("/users")) {
    folder = "users";
  } else if (req.path.includes("/products")) {
    folder = "products";
  }

  req.uploadFolder = path.join(__dirname, `../static/${folder}`);

  // Assurez-vous que le dossier existe
  if (!fs.existsSync(req.uploadFolder)) {
    fs.mkdirSync(req.uploadFolder, { recursive: true });
  }
  console.log(`Upload folder set to: ${req.uploadFolder}`);
  next();
};

module.exports = setUploadFolder;
