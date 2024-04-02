const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const {fileUploader} = require("../utils/fileUploader");

// createSubSection
exports.createSubSection = async (req, res) => {
    try {
        // extract data from request body
        const {sectionId, title, description} = req.body;
        const video = req.files.video;
        console.log("video from req is : ", video);

        // data validation
        if (!sectionId || !title || !description || !video) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required for creating a subsection" 
            })
        }

        // upload video to cloudinary
        const uploadDetails = await fileUploader(
            video,
            process.env.FOLDER_NAME
        )

        console.log("Cloudinary upload details for video are : ", uploadDetails);

        // create a new sub-section 
        const SubSectionDetails = await SubSection.create({
            title: title,
            timeDuration: `${uploadDetails.duration}`,
            description: description,
            videoUrl: uploadDetails.secure_url,
        });

        // update the corresponding section with the newly created sub-section
        const updatedSection = await Section.findByIdAndUpdate(
            {_id: sectionId},
            {
                $push: {
                    subSection: SubSectionDetails._id
                }
            },
            {new: true}
        ).populate("subSection");

        return res.status(200).json({ 
            success: true, 
            data: updatedSection ,
            message: "Subsection created successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to create a subsection",
            error: error.message
        })
    }
}
  
// updateSubSection
exports.updateSubSection = async (req, res) => {
    try {
        // extract data 
        const {sectionId, subSectionId, title, description} = req.body;
        const video = req?.files?.video;

        // data validation
        if(!sectionId || !subSectionId || !title || !description) {
            return res.status(400).json({
                success: false,
                message: "All fields are required to update a subsection"
            })
        }

        // find subsection whom we wish to update
        const subSection = await SubSection.findById(subSectionId);
        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            })
        }

        if (title !== undefined) {
            subSection.title = title;
        }

        if (description !== undefined) {
            subSection.description = description;
        }

        // upload the file and update the subsection
        if (req.files && req.files.video !== undefined) {
            const video = req.files.video;
            const uploadDetails = await fileUploader(
                video,
                process.env.FOLDER_NAME
            )

            subSection.videoUrl = uploadDetails.secure_url;
            subSection.timeDuration = `${uploadDetails.duration}`
        }

        await subSection.save();

        // find the updated section 
        const updatedSection = await Section.findById(sectionId).populate("subSection");
        return res.json({
            success: true,
            data:updatedSection,
            message: "Subsection updated successfully",
        })
    } catch (error) {
            return res.status(500).json({
            success: false,
            message: "An error occurred while updating the sub-section",
        })
    }
}

// deleteSubSection
exports.deleteSubSection = async (req, res) => {
    try {
        // fetch data
        const {subSectionId, sectionId} = req.body;

        // data validation
        if(!subSection || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required to delete a subsection"
            })
        }

        // find the Section whom we wish to delete subsection from
        await Section.findByIdAndUpdate(
            {_id: sectionId},
            {
                $pull: {
                    subSection: subSectionId,
                },
            }
        )

        // find the subsection which needs to be deleted
        const subSection = await SubSection.findByIdAndDelete({_id: subSectionId});
        if (!subSection) {
            return res.status(404).json({ 
                success: false, 
                message: "SubSection not found while deleting" 
            })
        }

        // update the section after deleting the subsection
        const updatedSection = await Section.findById(sectionId).populate("subSection");
        return res.status(200).json({
            success: true,
            data:updatedSection,
            message: "SubSection deleted successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the SubSection",
        })
    }
}