const express = require("express")
const router = express.Router()

const {login, signUp, sendOTP, changePassword} = require("../controllers/Auth")
const {resetPasswordToken, resetPassword} = require("../controllers/ResetPassword")
const { auth } = require("../middlewares/auth")

// Routes for Login, Signup, and Authentication


// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// User login
router.post("/login", login);
// User signup
router.post("/signup", signUp);
// Sending OTP to the user's email
router.post("/sendotp", sendOTP);
// Changing the password
router.post("/changepassword", auth, changePassword);


// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

// Generating a reset password token
router.post("/reset-password-token", resetPasswordToken);
// Resetting user's password after verification
router.post("/reset-password", resetPassword);

module.exports = router;