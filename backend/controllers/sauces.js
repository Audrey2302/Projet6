// Récupération du module 'file system' de Node 
const fs = require('fs'); 

const Sauce = require('../models/sauce');


//Creation d'une sauce
exports.createSauce= (req, res, next) => {
  //pour ajouter un fichier à la requête, le front-end doit envoyer les données de la requête sous la forme form-data et non sous forme de JSON.
  const sauceObject = JSON.parse(req.body.sauce); 
  //On supprime l'id et l'userId
  delete sauceObject._id; 
  delete sauceObject._userId; 
  
  //Création d'une instance du modèle Sauce
  const sauce = new Sauce({ 
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
    });
  sauce.save()
  .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
  .catch(error => { res.status(400).json( { error })})
};



//Permet de récupérer une seule sauce
exports.getOneSauce = (req, res, next) => {
  // On utilise la méthode findOne et on lui passe l'objet de comparaison, on veut que l'id de la sauce soit le même que le paramètre de requête
  Sauce.findOne({
    _id: req.params.id
  })
  .then((sauce) => {res.status(200).json(sauce);}) //// Si ok on retourne une réponse et l'objet
  .catch((error) => {res.status(404).json({error: error});});
};



//Pour modifier une sauce
exports.modifySauce = (req, res, next) => {

  const sauceObject = req.file ? { 
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete sauceObject._userId;

  Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({ message : 'Not authorized'});
          } else {
              Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Objet modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {res.status(400).json({ error });});
};



//Pour la suppression
exports.deleteSauce = (req, res, next) => {
  
  Sauce.findOne({ _id: req.params.id})
      .then(sauce => {
          
          if (sauce.userId != req.auth.userId) { 
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = sauce.imageUrl.split('/images/')[1]; 
              fs.unlink(`images/${filename}`, () => { 
                  sauce.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {res.status(500).json({ error });});
};



//Récupération de toutes les sauces de la base de données
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {res.status(200).json(sauces);})
    .catch((error) => {res.status(400).json({error: error});}
  );
};



//Pour le like et le dislike
exports.likeDislike = (req, res, next) => {

  let like = req.body.like
  let userId = req.body.userId
  let sauceId = req.params.id

  if (like === 1) { // Si il s'agit d'un like
    Sauce.updateOne({ _id: sauceId}, { //mettre à jour une sauce dans la base de donnée
        //On push l'utilisateur
        $push: {
          usersLiked: userId
        },
        $inc: {
          likes: +1
        }, // On incrémente de 1
      })
      .then(() => res.status(200).json({message: "j'aime ajouté !"}))
      .catch((error) => res.status(400).json({error}))
  }

  if (like === -1) { // S'il s'agit d'un dislike
    Sauce.updateOne({_id: sauceId}, {
          $push: {
            usersDisliked: userId
          },
          $inc: {
            dislikes: +1
          }, 
        })
      .then(() => {res.status(200).json({message: 'Dislike ajouté !'})})
      .catch((error) => res.status(400).json({error}))
  }

  if (like === 0) { // Si il s'agit d'annuler un like ou un dislike
    Sauce.findOne({_id: sauceId}) 

      .then((sauce) => {

        if (sauce.usersLiked.includes(userId)) { 
          Sauce.updateOne({_id: sauceId}, {
              $pull: {
                usersLiked: userId
              },
              $inc: {
                likes: -1
              }, 
            })
            .then(() => res.status(200).json({message: 'Like retiré !'}))
            .catch((error) => res.status(400).json({error}))
        }

        if (sauce.usersDisliked.includes(userId)) {
          Sauce.updateOne({_id: sauceId}, {
              $pull: {
                usersDisliked: userId
              },
              $inc: {
                dislikes: -1
              }, 
            })
            .then(() => res.status(200).json({message: 'Dislike retiré !'}))
            .catch((error) => res.status(400).json({error}))
        }
      })
      .catch((error) => res.status(404).json({error}))
  }
}


