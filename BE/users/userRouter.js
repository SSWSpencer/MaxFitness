const router = require("express").Router();

const Users = require("./userModel.js");
const adminRestrict = require("../auth/adminRestricted.js");
const empRestrict = require("../auth/empRestricted.js");


router.get("/", adminRestrict, (req, res)=>{
    Users.getAll()
    .then(users=>{
        res.status(200).json(users);
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({error: "could not load users"})
    })
})

router.get("/:id", adminRestrict, (req, res)=>{
    Users.findById(req.params.id)
    .then(user=>{
        if(user){
            res.status(200).json(user)
        }
        else{
            res.status(404).json({error: "user not found"})
        }
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({error: "unable to find user"})
    })
})

module.exports = router;