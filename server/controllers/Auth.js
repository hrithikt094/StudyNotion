const User = require('../models/User')
const OTP = require('../models/OTP')
const otpGenerator = require('otp-generator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const mailSender = require("../utils/mailSender")
const { passwordUpdated } = require("../mail/templates/passwordUpdate")
const Profile = require("../models/Profile")

// sendOTP
exports.sendOTP = async (req, res) => {
    try {
        // fetch email from request body
        const {email} = req.body;

		// check if user is already present
		const checkUserPresent = await User.findOne({email});

		// if user already exists
		if (checkUserPresent) {
			return res.status(401).json({
				success: false,
				message: "User is already registered",
			});
		}

        // generate OTP
		var otp = otpGenerator.generate(6, {
			upperCaseAlphabets: false,
			lowerCaseAlphabets: false,
			specialChars: false,
		});

        // check unique OTP or not
		let result = await OTP.findOne({otp: otp});
		console.log("OTP generated is : ", otp);
		while (result) {
			otp = otpGenerator.generate(6, {
				upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
			    specialChars: false,
			});

            result = await OTP.findOne({otp: otp});
		}

		const otpPayload = {email, otp};
        // create an entry for OTP
		const otpBody = await OTP.create(otpPayload);
		console.log("otpBody is : ", otpBody);

		res.status(200).json({
			success: true,
			message: "OTP Sent Successfully",
			otp,
		});
    } catch (error) {
        console.log(error.message);
		return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// signUp
exports.signUp = async (req, res) => {
    try {
        // fetch data from request body
        const {firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp} = req.body;

        // validation
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are required for signup",
            })
        }

        if(password !== confirmPassword) {
            return res.status(400).json({
				success: false,
				message: "Password and Confirm Password do not match. Please try again.",
			});
        }

        // check user already exists or not
        const existingUser = await User.findOne({email});
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "User already exists. Please login to continue.",
			});
		}

        // find most recent OTP
        const recentOTP = await OTP.find({email}).sort({createdAt: -1}).limit(1);
        console.log("recentOTP found is : ", recentOTP);

        // validate OTP
        if (recentOTP.length === 0) {
			return res.status(400).json({
				success: false,
				message: "OTP not found for sign-up process",
			});
		} 
        
        else if (otp !== recentOTP[0].otp) {
			// Invalid OTP
			return res.status(400).json({
				success: false,
				message: "The OTP is not valid while signing-up",
			});
		}

        // hash the password
		const hashedPassword = await bcrypt.hash(password.toString(), 10);

        // create the user
        let approved = "";
        approved === "Instructor" ? (approved = false) : (approved = true);

        // create additionalDetails i.e. profile for User
		const profileDetails = await Profile.create({
			gender: null,
			dateOfBirth: null,
			about: null,
			contactNumber: null,
		});

        // create entry in DB
        const user = await User.create({
            firstName,
            lastName,
            password: hashedPassword,
            email,
            accountType,
            contactNumber,
            additionalDetails: profileDetails._id,
            approved: approved,
            image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}&backgroundColor=00897b,00acc1,039be5,1e88e5,3949ab,43a047,5e35b1,7cb342,8e24aa,c0ca33,d81b60,e53935,f4511e,fb8c00,fdd835,ffb300,ffd5dc,ffdfbf,c0aede,d1d4f9,b6e3f4&backgroundType=solid,gradientLinear&backgroundRotation=0,360,-350,-340,-330,-320&fontFamily=Arial&fontWeight=600`
        })

        return res.status(200).json({
			success: true,
			user,
			message: "User has been registered successfully",
		});
    } catch (error) {
        console.error(error);
		return res.status(500).json({
			success: false,
			message: "User cannot be registered. Please try again.",
		});
    }
}

// Login
exports.login = async (req, res) => {
    try {
        // fetch data from request body
		const { email, password } = req.body;

		// data validation
		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: "All fields are required for login",
			});
		}

		// check if user exists
		const user = await User.findOne({email}).populate("additionalDetails");

		// If user not found with provided email
		if (!user) {
			return res.status(401).json({
				success: false,
				message: `User is not registered with us. Please signup to continue.`,
			});
		}

        // generate JWT token and compare password
		if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email, 
                id: user._id, 
                accountType: user.accountType
            }

			const token = jwt.sign(payload, process.env.JWT_SECRET,{
				expiresIn: "24h",
			});

			// save token to user document in database
			user.token = token;
			user.password = undefined;

			// set cookie for token
			const options = {
				expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
				httpOnly: true,
			};

			res.cookie("token", token, options).status(200).json({
				success: true,
				token,
				user,
				message: "User logged-in successfuly",
			});
		} 
        
        else {
			return res.status(401).json({
				success: false,
				message: "Password is incorrect while logging-in",
			});
		}
    } catch (error) {
        console.error(error);
		return res.status(500).json({
			success: false,
			message: "Login failure. Please try again",
		});
    }
}

// changePassword
exports.changePassword = async (req, res) => {
    try {
        // fetch password from req
        const {oldPassword, newPassword, confirmNewPassword} = req.body;

        // get user who wishes to change the password
        const userDetails = await User.findById(req.user._id);

        // validation
        const doesPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password);
        if(oldPassword === newPassword) {
            return res.status(400).json({
				success: false,
				message: "New password cannot be same as old password while changing password",
			});
        }

        if(!doesPasswordMatch) {
            return res.status(401).json({ 
                success: false, 
                message: "The password is incorrect while changing password" 
            });
        }

        // match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match while changing password",
			});
		}

		// update password in DB
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(req.user.id,
			{password: hashedPassword},
			{new: true}
		);

        // send password change email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				"Study Notion - Password Updated",
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			
            console.log("Email sent successfully for password change : ", emailResponse.response);
		} catch (error) {
			console.error("Error occurred while sending email about password chnage :", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email of password change while changing password",
				error: error.message,
			});
		}

        return res.status(200).json({ 
            success: true, 
            message: "Password updated successfully" 
        });
    } catch (error) {
        console.error("Error occurred while changing password : ", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while changing password",
			error: error.message,
		});
    }
}