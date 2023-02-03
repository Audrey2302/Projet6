
// On importe multer qui est un package qui permet de gérer les fichiers entrants dans les requêtes HTTP
const multer = require('multer');

const IMAGE_TYPES = { 
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// On crée un objet de configuration pour préciser à multer où enregistrer les fichiers images et les renommer
const storage = multer.diskStorage({
  //On mets la destination d'enregistrement des images
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  //On dit à multer quel nom de fichier on utilise pour éviter les doublons
  filename: (req, file, callback) => {
     //On génère un nouveau nom
    const name = file.originalname.split(' ').join('_'); 
    const extension = IMAGE_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});


// On export le module, on lui passe l'objet storage, la méthode single pour dire que c'est un fichier unique et on précise que c'est une image
module.exports = multer({storage: storage}).single('image'); 