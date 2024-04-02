const mailSender = require("../utils/mailSender");

// contactUs
exports.contactUs = async (req, res) => {
    // fetch data
    const {firstName, lastName, email, message, phoneNo} = req.body;

    // validation
    if (!firstName || !email || !message) {
        return res.status(403).send({
            success: false,
            message: "All Fields are required for contacting",
        });
    }

    try {
        // store all data into an object
        const data = {
            firstName,
            lastName: `${lastName ? lastName : "null"}`,
            email,
            message,
            phoneNo: `${phoneNo ? phoneNo : "null"}`,
        };
        
        // send mail
        const info = await mailSender(
            process.env.CONTACT_MAIL,
            "Enquery",
            `<html><body>${Object.keys(data).map((key) => {
                return `<p>${key} : ${data[key]}</p>`;
            })}</body></html>`
        );

        if (info) {
            return res.status(200).send({
                success: true,
                message: "Your message has been sent successfully",
            });
        } 
        
        else {
            return res.status(403).send({
                success: false,
                message: "Something went wrong while sending contact us confirmation mail",
            });
        }
    } catch (error) {
        return res.status(403).send({
            success: false,
            message: "Something went wrong",
        });
    }
};