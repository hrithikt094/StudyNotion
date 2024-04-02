const { mongoose, ObjectId, mongo } = require("mongoose");
const CourseProgress = require('../models/CourseProgress')
const SubSection = require("../models/SubSection");

// course progress
exports.updateCourseProgress = async(req, res) => {
    const {courseId, subSectionId, userId} = req.body;
    // const userId = req.user.id;

    try{
        //check if the subsection is valid
        const subSection = await SubSection.findById(subSectionId);

        // validation
        if(!subSection) {
            return res.status(404).json({
                error:"Invalid subSection"
            });
        }

        //check for old entry        
        let courseProgress = await CourseProgress.findOne({
            courseId: courseId,
            userId: userId
        });

        console.log("courseProgress is : ", courseProgress);

        if(!courseProgress) {
            return res.status(404).json({
                success: false,
                message: "Course Progress does not exist"
            });
        }
        
        else {
            console.log("Course Progress Validation Done");
            //check for re-completing video/subsection
            if(courseProgress.completedVideos.includes(subSectionId)) {
                return res.status(400).json({
                    error:"subSection already completed",
                });
            }

            //push into completed video
            courseProgress.completedVideos.push(subSectionId);
            console.log("Course Progress Push Done");
        }

        await courseProgress.save();
        console.log("Course Progress save call done");
        return res.status(200).json({
            success:true,
            message:"Course Progress Updated Successfully",
        })
    } catch(error) {
        console.error(error);
        return res.status(400).json({
            error:"Internal Server Error"
        });
    }
}