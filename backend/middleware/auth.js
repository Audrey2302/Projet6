//Récupération du package jsonwebtoken
const jwt = require('jsonwebtoken');
 
//Ce middleware sera appliqué à toutes les routes afin de les sécuriser
module.exports = (req, res, next) => {
   try {
       //Nous utilisons la fonction split pour tout récupérer après l'espace dans le header. Les erreurs générées ici s'afficheront dans le bloc catch.
       const token = req.headers.authorization.split(' ')[1]; 
       //Nous utilisons ensuite la fonction verify pour décoder notre token. Si celui-ci n'est pas valide, une erreur sera générée
       const decodedToken = jwt.verify(token, process.env.Secret_Token); 
       //On extrait l'ID utilisateur de notre token et le rajoutons à l’objet Request afin que nos différentes routes puissent l’exploiter.
       const userId = decodedToken.userId; 
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error }); 
   }
};