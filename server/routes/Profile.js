const express = require("express")
const router = express.Router()

const {auth, isInstructor} = require("../middlewares/auth")
const {deleteAccount, updateProfile, getAllUserDetails, updateDisplayPicture, 
    getEnrolledCourses, instructorDashboard} = require("../controllers/Profile")


// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************

// Delete User Account
router.delete("/deleteProfile", auth, deleteAccount);
// Update User Account
router.put("/updateProfile", auth, updateProfile);
// Get User Details
router.get("/getUserDetails", auth, getAllUserDetails);
// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses);
// Update Display Picture
router.put("/updateDisplayPicture", auth, updateDisplayPicture);
// Get Instructor Dashboard details
router.get("/getInstructorDashboardDetails", auth, isInstructor, instructorDashboard);

module.exports = router;