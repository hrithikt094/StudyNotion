const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require('../models/SubSection')

// createSection
exports.createSection = async (req, res) => {
	try {
		// fetch data from request
		const {sectionName, courseId} = req.body;

		// data validation
		if (!sectionName || !courseId) {
			return res.status(400).json({
				success: false,
				message: "Missing required properties while creating section",
			});
		}
		
        // check if course exists
		const ifCourseExists = await Course.findById(courseId);
		if (!ifCourseExists) {
			return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

		// create a new section with the given name
		const newSection = await Section.create({sectionName});

		// add the new section to the course [update course with section ObjectId]
		const updatedCourseDetails = await Course.findByIdAndUpdate(
			courseId,
			{
				$push: {
					courseContent: newSection._id,
				},
			},
			{new: true}
		)
        .populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        })
        .exec();

		return res.status(200).json({
			success: true,
			message: "Section created successfully",
			updatedCourseDetails,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Unable to create section",
			error: error.message,
		});
	}
};

// updateSection
exports.updateSection = async (req, res) => {
	try {
		// fetch data
		const {sectionName, sectionId, courseId} = req.body;
		
		// data validation
		if(!sectionName || !sectionId || !courseId) {
			return res.status(401).json({
				success: false,
				message: "All fields are required for updating a section"
			})
		}

		// find the section and update it
		const section = await Section.findByIdAndUpdate(
			sectionId,
			{sectionName},
			{new: true}
		);

		// why need to updatde course ? [as course has sectionId not section details]
		const course = await Course.findById(courseId)
		.populate({
			path:"courseContent",
			populate:{
				path: "subSection",
			},
		})
		.exec();

		return res.status(200).json({
			success: true,
			message: section,
			data:course,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Unable to update a section",
			error: error.message,
		});
	}
}

// deleteSection
exports.deleteSection = async (req, res) => {
	try {
		// fetch data
		const {sectionId, courseId}  = req.body;
		
		// data validation
		if(!sectionId || !courseId) {
			return res.status(401).json({
				success: false,
				message: "All fields are required for deleting a section"
			})
		}

		// find the course containing the section and update it
		await Course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		})

		// find the section whom we wish to delete
		const section = await Section.findById(sectionId);
		if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not found",
			})
		}

		//delete sub section associated with the section whom we wish to delete 
		await SubSection.deleteMany({_id: {$in: section.subSection}});

		// delete the section 
		await Section.findByIdAndDelete(sectionId);

		//find the related course and update it 
		const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSection"
			}
		})
		.exec();

		return res.status(200).json({
			success:true,
			message:"Section deleted successfully",
			data:course
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Unable to delete a section",
		});
	}
};   