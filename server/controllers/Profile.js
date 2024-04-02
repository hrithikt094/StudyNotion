const { default: mongoose } = require('mongoose');
const Profile = require('../models/Profile');
const User = require('../models/User');
const {fileUploader} = require('../utils/fileUploader');
const Course = require('../models/Course');
const { convertSecondsToDuration } = require("../utils/secToDuration")
const {CourseProgress} = require('../models/CourseProgress');

// updateProfile
exports.updateProfile = async (req, res) => {
    try{
        // fetch data
        const {dateOfBirth = "", about = "", contactNumber = "", firstName, lastName, gender = "" } = req.body;
        // get userId
        const {id} = req.user; // [payload -> decode]

        // validation
        
        // find the profile which wants to update
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
        
        // find and update the user 
        const user = await User.findByIdAndUpdate(id, {
            firstName,
            lastName,
        });
        
        // save the updated user
        await user.save();

        // update the profile fields
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        profileDetails.gender = gender;

        // save the updated profile
        await profileDetails.save();

        // find the updated user details
        const updatedUserDetails = await User.findById(id).populate("additionalDetails").exec();
        console.log("Updated user details are : ", updatedUserDetails);
        return res.status(200).json({
            success : true,
            message : "Profile updated successfully",
            user : updatedUserDetails,
            profileDetails
        });
    } catch(error){
        return res.status(200).json({
            success : false,
            message : "Profile update error"
        });
    }
}

// deleteProfile
exports.deleteAccount = async (req, res) => {
    try{
        // fetch data from request
        const userId = req.user.id;

        // validation
        if(!userId) {
            return res.status(400).json({
                success : false,
                message : "Invalid userId"
            });
        }

        // find user to be deleted
        const userDetails = await User.findById(userId);
        if(!userDetails){
            return res.status(404).json({
                success : false,
                message : "No user exists with this id to delete"
            });
        }

        // delete the profile and user
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        await User.findByIdAndDelete({_id : userId});

        // TODO : Uneroll user from all the enrolled courses
        return res.status(200).json({
            success : true,
            message : "User-Profile deleted successfully"
        });
    } catch(error){
        return res.status(400).json({
            success : false,
            message : "User-Profile deletion not successful"
        });
    }
}

// getAllUserDetails
exports.getAllUserDetails = async (req, res) => {
    try {
        // fetch data i.e. userId
        const id = req.user.id;

        // get user details [would have to populate as findById gives userId and to get all details we need to populate]
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        return res.status(200).json({
            success: true,
            message: "User data fetched successfully",
            data: userDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}


















// exports.getEnrolledCourses = async (req, res) => {
//     try {
//       const userId = req.user.id
//       let userDetails = await User.findOne({
//         _id: userId,
//       })
//         .populate({
//           path: "courses",
//           populate: {
//             path: "courseContent",
//             populate: {
//               path: "subSection",
//             },
//           },
//         })
//         .exec()
//       userDetails = userDetails.toObject()
//       var SubsectionLength = 0
//       for (var i = 0; i < userDetails.courses.length; i++) {
//         let totalDurationInSeconds = 0
//         SubsectionLength = 0
//         for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
//           totalDurationInSeconds += userDetails.courses[i].courseContent[
//             j
//           ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
//           userDetails.courses[i].totalDuration = convertSecondsToDuration(
//             totalDurationInSeconds
//           )
//           SubsectionLength +=
//             userDetails.courses[i].courseContent[j].subSection.length
//         }
//         let courseProgressCount = await CourseProgress.findOne({
//           courseID: userDetails.courses[i]._id,
//           userId: userId,
//         })
//         courseProgressCount = courseProgressCount?.completedVideos.length
//         if (SubsectionLength === 0) {
//           userDetails.courses[i].progressPercentage = 100
//         } else {
//           // To make it up to 2 decimal point
//           const multiplier = Math.pow(10, 2)
//           userDetails.courses[i].progressPercentage =
//             Math.round(
//               (courseProgressCount / SubsectionLength) * 100 * multiplier
//             ) / multiplier
//         }
//       }
  
//       if (!userDetails) {
//         return res.status(400).json({
//           success: false,
//           message: `Could not find user with id: ${userDetails}`,
//         })
//       }
//       return res.status(200).json({
//         success: true,
//         data: userDetails.courses,
//       })
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       })
//     }
//   }

exports.getEnrolledCourses=async (req,res) => {
	try {
        const id = req.user.id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const enrolledCourses = await User.findById(id).populate({
			path : "courses",
				populate : {
					path: "courseContent",
			}
		}
		).populate("courseProgress").exec();
        console.log("enrolled courses are : " , enrolledCourses);
        return res.status(200).json({
            success: true,
            message: "User Data fetched successfully",
            data: enrolledCourses,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

//updateDisplayPicture
exports.updateDisplayPicture = async (req, res) => {
	try {

		const id = req.user.id;
	const user = await User.findById(id);
	if (!user) {
		return res.status(404).json({
            success: false,
            message: "User not found",
        });
	}
	const image = req.files.displayPicture;
    console.log("Image is : ", image);
	if (!image) {
		return res.status(404).json({
            success: false,
            message: "Image not found",
        });
    }
	const uploadDetails = await fileUploader(
		image,
		process.env.FOLDER_NAME
	);
	console.log(uploadDetails);

	const updatedImage = await User.findByIdAndUpdate({_id:id},{image:uploadDetails.secure_url},{ new: true });

    res.status(200).json({
        success: true,
        message: "Image updated successfully",
        data: updatedImage,
    });
		
	} catch (error) {
		return res.status(500).json({
            success: false,
            message: error.message,
        });
	}
}

//instructor dashboard
exports.instructorDashboard = async (req, res) => {
	try {
		const id = req.user.id;
		const courseDetails = await Course.find({instructor:id});
		const courseData = courseDetails.map((course) => {
			totalStudentsEnrolled = course?.studentsEnrolled?.length;
			totalAmountGenerated = course?.price * totalStudentsEnrolled;

            // create a course with the additional fields
			const courseDataWithStats = {
				_id: course._id,
				courseName: course.courseName,
				courseDescription: course.courseDescription,
				totalStudentsEnrolled,
				totalAmountGenerated,
			};

			return courseDataWithStats;
		});

		return res.status(200).json({
			// success: true,
			// message: "User Data fetched successfully",
			// data: courseData,
            courses: courseData
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
}