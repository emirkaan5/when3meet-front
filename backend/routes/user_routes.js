const router = require("express").Router();
const userCtrl = require("../controllers/user_controller");
router.post("/", userCtrl.createUser);

module.exports = router;