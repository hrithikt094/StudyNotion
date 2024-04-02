const Category = require("../models/Category");
const Course = require("../models/Course");

function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

// createCategory
exports.createCategory = async (req, res) => {
    try {
        // fetch data from req
        const {name, description} = req.body;

        // validation
        if(!name || !description) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required for creating a category" 
            });
        }

        // create entry in DB
        const CategoryDetails = await Category.create({
			name: name,
			description: description,
		});

		console.log("Category details are : ", CategoryDetails);
		return res.status(200).json({
			success: true,
			message: "Category created successfully",
		});
    } catch (error) {
        return res.status(500).json({
			success: true,
			message: error.message,
		});
    }
}

// getAllCategories
exports.showAllCategories = async (req, res) => {
	try {
		const allCategories = await Category.find({}, {name: true, description: true});
		return res.status(200).json({
			success: true,
            message: "All categories returned successfully",
			data: allCategories,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// categoryPageDetails
exports.categoryPageDetails = async (req, res) => {
	try {
		// fetch categoryId from req
		const {categoryId} = req.body;

		// get courses for the specified category
		const selectedCategory = await Category.findById(categoryId)
		.populate({
			path: "courses",
			match: {
				status: "Published"
			},
			
			populate: ([
				{
					path:"instructor"
				},
				{
					path:"ratingAndReviews"
				}
			])
		})
		.exec();

		// console.log("Selected course [category] is : ", selectedCategory);
		if (!selectedCategory) {
			console.log("Category not found");
			return res.status(404).json({ 
				success: false, 
				message: "Category not found" 
			});
		}

		if (selectedCategory.courses.length === 0) {
			console.log("No courses found for the selected category");
			return res.status(404).json({
				success: false,
				message: "No courses found for the selected category.",
			});
		}

		const selectedCourses = selectedCategory.courses;

		// get courses for other categories
		const categoriesExceptSelected = await Category.find({
			_id: { $ne: categoryId },   // not equals
		})
		.populate({
			path:"courses",
			match:{
				status:"Published"
			},
			populate: ([
				{
					path:"instructor"
				},
				{
					path:"ratingAndReviews"
				}
			])
		})
		.exec();

		// different courses
		let differentCourses = [];
		for (const category of categoriesExceptSelected) {
			differentCourses.push(...category.courses);
		}

		let differentCategory = await Category.findOne(
			categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
			._id
		)
		.populate({
			path: "courses",
			match: {
				status: "Published"
			}
		})

		// get top-selling courses across all categories
		const allCategories = await Category.find()
		.populate({
			path:"courses",
			match:{
				status:"Published"
			},
			populate:([
				{
					path:"instructor"
				},
				{
					path:"ratingAndReviews"
				}
			])
		})
		.exec();

		// data: {
		// 	selectedCourses: selectedCourses,
		// 	differentCourses: differentCourses,
		// 	mostSellingCourses: mostSellingCourses,
		// }

		// get allCourses and find most selling out of them
		const allCourses = allCategories.flatMap((category) => category.courses); // flatMap?
		const mostSellingCourses = allCourses.sort((a, b) => b.sold - a.sold).slice(0, 10);
		return res.status(200).json({
			success: true,
			data: {
				selectedCategory,
				differentCategory,
				mostSellingCourses
			}
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};




















//add course to category
exports.addCourseToCategory = async (req, res) => {
	const { courseId, categoryId } = req.body;
	// console.log("category id", categoryId);
	try {
		const category = await Category.findById(categoryId);
		if (!category) {
			return res.status(404).json({
				success: false,
				message: "Category not found",
			});
		}
		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({
				success: false,
				message: "Course not found",
			});
		}
		if(category.courses.includes(courseId)){
			return res.status(200).json({
				success: true,
				message: "Course already exists in the category",
			});
		}
		category.courses.push(courseId);
		await category.save();
		return res.status(200).json({
			success: true,
			message: "Course added to category successfully",
		});
	}
	catch (error) {
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
}