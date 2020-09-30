const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = require("express").Router();

const Users = require("../users/userModel.js")
const secrets = require("../config/secrets.js")

router.post("/register", (req, res)=>{
    const credentials = req.body;
    if(isValid(credentials)){
        const rounds = process.env.BCRYPT_ROUNDS || 8;
        const hash = bcryptjs.hashSync(credentials.password, rounds);
        credentials.password = hash;
        Users.add(credentials)
        .then(user=>{
            res.status(201).json({data: user});
        })
        .catch(err=>{
            console.log(err)
            res.status(500).json({error: "could not register user, email might already be taken"})
        })
    }
    else{
        res.status(400).json({error: "registration requires an email and a password"})
    }
})

router.post("/login", (req, res)=>{
    const {email, password} = req.body;
    if(isValid(req.body)){
        Users.findBy({email: email})
        .then(([user])=>{
            if(user && bcryptjs.compareSync(password, user.password)) {
                const token = generateToken(user);
                res.status(200).json(token)
            }
            else{
                res.status(401).json({error: "invalid credentials"})
            }
        })
        .catch(err=>{
            console.log(err)
            res.status(500).json({error: "unable to log in"})
        })
    }
    else{
        res.status(400).json({error: "login requires an email and a password"})
    }
})

function generateToken(user) {
    const payload = {
      subject: user.id, 
      email: user.email,
      role: user.role,
    };
  
    const options = {
      expiresIn: '1d', 
    };
    return jwt.sign(payload, secrets.jwtSecret, options);
  }
  

function isValid(user) {
    return Boolean(user.email && user.fName && user.lName && user.password && typeof user.password === "string" && user.role);
  }

  module.exports = router;