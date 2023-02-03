//bcrypt pour hasher le mot de passe des utilisateur
const bcrypt = require ('bcrypt'); 
const User = require ('../models/user');
//Utilisation du package pour attribuer un token à un utilisateur au moment ou il se connecte
const jwt = require('jsonwebtoken');
//package qui permet de lire les variables d'environnement
require('dotenv').config();


//Middleware pour créer un nouvel utilisateur
exports.signup = (req, res, next) => {  

    bcrypt.hash(req.body.password, 10) 

        .then(hash => { 
        
            const user = new User({ 
                email: req.body.email,
                password: hash
            });

            user.save() 
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
            })

        .catch(error => res.status(500).json({ error }));
};


// Le Middleware pour la connexion d'un utilisateur
exports.login = (req, res, next) => { 

    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) { 
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
            }
            
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {

                    if (!valid) { 
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }

                    
                    res.status(200).json({  
                        userId: user._id,
                        token: jwt.sign( 
                            { userId: user._id },
                            process.env.Secret_Token, 
                            { expiresIn: '24h' } 
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};
