const RatingAndReview = require("../models/RatingAndReview")
const Course = require("../models/Course");
const {mongoose} = require("mongoose");

// createRating
exports.createRating = async (req, res) => {
    try {
        // get userId
        const userId = req.user.id;
        
        // fetch data
        const {rating, review, courseId} = req.body;
        
        // find the course whom you wish to give rating
        const courseDetails = await Course.find({
            _id: courseId,
            studentsEnrolled: {
                $elemMatch:{       // used for matching
                    $eq:userId     // used for equal matching
                }
            }
        });
    
        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message: "Student not enrolled in course to give rating"
            });
        };

        // check if user has already reviewed
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId
        });
    
        if(alreadyReviewed){
            return res.status(404).json({
                success: false,
                message: "Already reviewed by the user"
            });
        }

        // create rating
        const ratingReview = await RatingAndReview.create({
            rating,
            review,
            course: courseId,
            user: userId
        });
    
        // find the course for the rating and update it    
        await Course.findByIdAndUpdate(
            {_id:courseId},
            {
                $push:{
                    ratingAndReviews: ratingReview._id
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: "Rating added successfully",
            ratingReview
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        }); 
    }
}

// getAverageRatingAndReview
exports.getAverageRating = async (req, res) => {
    try {
        // fetch courseId whose average rating needs to be calculated
        const courseId = req.body.courseId;

        // calculate average rating
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId),
                }
            },
            {
                $group:{   // used to group
                    _id:null,
                    averageRating: {$avg:"$rating"}   // used for average
                }
            }
        ]);

        // if rating exists
        if(result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating
            });
        }

        // if no rating exists return 0
        else{
            return res.status(200).json({
                message: "Average rating is 0",
                averageRating: 0
            });
        }

        /*
            const course = await Course.findById(courseId).populate("ratingAndReviews").exec();
            const courseRatingAndReviews = course.ratingAndReviews;
            let sumRating = 0;
            for(let i = 0; i < courseRatingAndReviews.length; i++){
                sumRating += courseRatingAndReviews[i].rating;
            }

            const avgRating = sumRating / courseRatingAndReviews.length;
        */
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// getAllRating
exports.getAllRating = async (req,res) => {
    try {
        // get all reviews
        const allReviews = await RatingAndReview.find().sort({rating: -1})
        .populate({
            path: "user",
            select: "firstName lastName email image"
        })
        .populate({
            path: "course",
            select: "courseName"
        })
        .exec();
            
        return res.status(200).json({
            success: true,
            message: "All reviews fetched successfully",
            data: allReviews,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}