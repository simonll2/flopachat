const multer = require("multer");
const path = require("path");

// Configurer le stockage dynamique
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = req.uploadFolder;
    console.log(`Saving file to: ${dir}`);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

// Initialiser l'upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // Limite de taille des fichiers en octets
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("file");

// Vérifier le type de fichier
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

module.exports = upload;
