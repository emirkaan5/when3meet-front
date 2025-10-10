const router = require("express").Router();
const userCtrl = require("../controllers/user_controller");

router.post("/", userCtrl.createUser);
router.get("/",(req,res)=>{
    res.status(200).send("connected successfully");
});

module.exports = router;