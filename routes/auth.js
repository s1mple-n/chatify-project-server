
const { signin,signup,checkOTP,updatePassword,updatePhonenumber,checkPhonenumber,forgotPassword,changeVerifyOTP } = require('../controllers/authController.js');

const router = require("express").Router();
const { auth } = require("../middleware/auth");
router.post('/signin', signin);
router.post('/signup', signup);
router.post("/checkOTP", checkOTP);
router.post('/updatePassword',auth, updatePassword);
router.post('/updatePhonenumber',auth, updatePhonenumber);
router.post('/changeVerifyOTP',auth, changeVerifyOTP);
router.post('/checkPhonenumber', checkPhonenumber);
router.post('/forgotPassword', forgotPassword);

module.exports = router;  