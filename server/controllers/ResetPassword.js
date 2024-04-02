const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// resetPasswordToken (generates a link and sends it via mail)
exports.resetPasswordToken = async (req, res) => {
	try {
        // get email from req body
		const email = req.body.email;

        // check user for this mail
		const user = await User.findOne({ email: email });
		if (!user) {
			return res.json({
				success: false,
				message: `This email: ${email} is not registered with us. Enter a valid email `,
			});
		}

        // genearte token
		const token = crypto.randomBytes(20).toString("hex"); // ? 
        // [token is added so as to find the appropriate user and reset password]

        // update user by adding token and expiration time
		const updatedDetails = await User.findOneAndUpdate({ email: email },
			{
				token: token,
				resetPasswordExpires: Date.now() + 5 * 60 * 1000,
			},

			{ new: true }
		);

		console.log("DETAILS", updatedDetails);
        // create url
		const url = `http://localhost:3000/update-password/${token}`;
		
        // send mail contianing the url
        await mailSender(
			email,
			"Password Reset",
			`Your Link for email verification is ${url}. Please click this url to reset your password.`
		);

        // return response
		return res.status(200).json({
			success: true,
			message: "Email Sent Successfully, Please Check Your Email to Continue Further",
		});
	} catch (error) {
		return res.status(500).json({
			error: error.message,
			success: false,
			message: `Error in Sending the Reset Message`,
		});
	}
};

exports.resetPassword = async (req, res) => {
	try {
        // data fetch
		const { password, confirmPassword, token } = req.body;
        // [why token is taken from body? when it can be taken from req.params, its because 
        // frontend has put token in body on its own]

        // validation
		if (confirmPassword !== password) {
			return res.json({
				success: false,
				message: "Password and Confirm Password Does not Match",
			});
		}

        // get user details from db using token
		const userDetails = await User.findOne({ token: token });
		
        // if no entry - invalid token
        if (!userDetails) {
			return res.json({
				success: false,
				message: "Token is Invalid",
			});
		}

        // token time check
		if ((userDetails.resetPasswordExpires < Date.now())) {
			return res.json({
				success: false,
				message: `Token is Expired, Please Regenerate Your Token`,
			});
		}

        // hash password
		const encryptedPassword = await bcrypt.hash(password, 10);
		await User.findOneAndUpdate(
            { token: token },
			{ password: encryptedPassword },
			{ new: true }
		);

        // return response
		return res.status(200).json({
			success: true,
			message: `Password Reset Successful`,
		});
	} catch (error) {
		return res.status(500).json({
			error: error.message,
			success: false,
			message: `Some Error in Updating the Password`,
		});
	}
};



















// const User = require("../models/User");
// const mailSender = require("../utils/mailSender");
// const bcrypt = require("bcrypt");
// const crypto = require("crypto");

// // resetPasswordToken
// exports.resetPasswordToken = async (req, res) => {
// 	try {
//         // fetch email from req
// 		const email = req.body.email;

//         // fetch user who wishes to reset the password
// 		const user = await User.findOne({email: email});
// 		if (!user) {
// 			return res.status(402).json({
// 				success: false,
// 				message: `This email: ${email} is not registered with us. Enter a valid email.`,
// 			});
// 		}

//         // create reset password token
// 		const token = crypto.randomBytes(20).toString("hex");
        
//         // update User by adding token and expiration time
// 		const updatedDetails = await User.findOneAndUpdate(
// 			{email: email},
// 			{
// 				token: token,
// 				resetPasswordExpires: Date.now() + 5 * 60 * 1000,
// 			},
// 			{new: true}
// 		);

// 		console.log("Updated user deatails by reset password are : ", updatedDetails);
// 		const url = `http://localhost:3000/update-password/${token}`;

//         // send reset password link mail 
// 		await mailSender(
// 			email,
// 			"Password Reset",
// 			`Your link for email verification is ${url}. Please click this url to reset your password.`
// 		);

// 		return res.status(200).json({
// 			success: true,
// 			message: "Email sent successfully. Please check your email to change password.",
// 		});
// 	} catch (error) {
// 		return res.staus(500).json({
// 			error: error.message,
// 			success: false,
// 			message: "Error in creating a token for reset password",
// 		});
// 	}
// };

// // resetPassword 
// exports.resetPassword = async (req, res) => {
// 	try {
//         // fetch data from request
// 		const {password, confirmPassword, token} = req.body;
//         // [why did token came from body? as it is present in url at line 34 ??]
//         // [answer: frontend puts it in the req body]

// 		// console.log(password, confirmPassword);
// 		// console.log(password === confirmPassword);
//         // validation
// 		if (password != confirmPassword) {
// 			return res.status(401).json({
// 				success: false,
// 				message: "Password and Confirm Password do not match while reseting the password",
// 			});
// 		}

//         // fetch User who wishes to reset the password using token
// 		const userDetails = await User.findOne({token: token});
// 		if (!userDetails) {
// 			return res.status(401).json({
// 				success: false,
// 				message: "Token is invalid for reseting password",
// 			});
// 		}

// 		if (!(userDetails.resetPasswordExpires > Date.now())) {
// 			return res.status(403).json({
// 				success: false,
// 				message: "Token is expired. Please regenerate your token.",
// 			});
// 		}

//         // hash password
// 		const hashedPassword = await bcrypt.hash(password, 10);

//         // update User
// 		await User.findOneAndUpdate(
// 			{token: token},
// 			{password: hashedPassword},
// 			{new: true}
// 		);

// 		res.status(200).json({
// 			success: true,
// 			message: "Password reset successful",
// 		});
// 	} catch (error) {
// 		return res.status(401).json({
// 			error: error.message,
// 			success: false,
// 			message: `Some error occured in updating the password`,
// 		});
// 	}
// };