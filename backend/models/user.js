
const mongoose = require('mongoose');
// package qui valide l'unicité de l'email
const uniqueValidator = require('mongoose-unique-validator');


const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});


userSchema.plugin(uniqueValidator); 

// On exporte ce schéma sous forme de modèle : le modèle s'appellera user et on lui passe le shéma de données
module.exports = mongoose.model('User', userSchema);