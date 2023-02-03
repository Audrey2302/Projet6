const express = require('express');//Importation express
const mongoose = require('mongoose'); //importation de mongoose
const app = express();

//Plugin qui sert dans l'upload des images et permet de travailler avec les répertoires et chemin de fichier
const path = require('path');

//On importe les routes
const userRoutes = require('./routes/user');
const saucesRoutes = require('./routes/sauces');

//package qui permet de lire les variables d'environnement
const dotenv = require("dotenv");
dotenv.config();


//Connection à la base de données MongoDB
mongoose.connect( `mongodb+srv://${process.env.Secret_Username}:${process.env.Secret_Password}@cluster0.fzsjgyr.mongodb.net/?retryWrites=true&w=majority` ,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json()); //il intercepe toute les requete avec du json et met le corps directement sur l'objet requete

// Middleware Header pour contourner les erreurs en débloquant certains systèmes de sécurité CORS, afin que tout le monde puisse faire des requetes depuis son navigateur
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });


app.use('/api/sauces', saucesRoutes); //Va servir les routes dédiées aux sauces
app.use('/api/auth', userRoutes); //Va servir les routes dédiées aux utilisateurs 
app.use('/images', express.static(path.join(__dirname, 'images'))); //middleware qui permet de charger les fichiers qui sont dans le repertoire image


//Export de l'application express pour déclaration dans server.js
module.exports = app;