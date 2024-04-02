import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { apiConnector } from '../../services/apiConnector';
import countryCode from "../../data/countrycode.json"
import { contactusEndpoint } from '../../services/apis';

const ContactUsForm = () => {

    const [loading, setLoading] = useState(false); // [not that loading from authSlice as it is related to authentication and this page is an open one]
    const {register, handleSubmit, reset, formState: {errors, isSubmitSuccessful}} = useForm();

    useEffect( () => {
        if(isSubmitSuccessful) {
            reset({firstName: "", lastName: "", email: "", message: "", phoneNo: ""});
        }
    }, [reset, isSubmitSuccessful]);

    const submitContactForm = async(data) => {
        console.log(data);
        try {
            setLoading(true);
            const phoneNo = data.countryCode + "  " + data.phoneNo;
            const {firstName, lastName, email, message} = data;

            const res = await apiConnector("POST", contactusEndpoint.CONTACT_US_API,{
                firstName, lastName, email, message, phoneNo
            });
            
            if(res.data.success === true) {
                toast.success("Message sent successfully");
            }
            
            else { 
                toast.error("Something went wrong");
            }
            
            console.log("contact response: ", res);
            setLoading(false);
        } catch(error) {
            console.log(error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit(submitContactForm)} className={"flex flex-col gap-7"}>
                <div className="flex flex-col gap-5 lg:flex-row">
                    {/* First Name  */}
                    <div className="flex flex-col gap-2 lg:w-[48%]">
                        <label htmlFor="firstName" className="lable-style">
                            First Name
                        </label>
                        
                        <input 
                            type="text" 
                            name="firstName" 
                            id="firstName" 
                            placeholder="Enter First Name"
                            {...register("firstName", {required: true})} 
                            className="form-style"
                        />
                        
                        {/* error handling */}
                        {
                            errors.firstName && <span className=" text-yellow-25">Enter First Name*</span>
                        }
                    </div>

                    {/* Last Name  */}
                    <div className="flex flex-col gap-2 lg:w-[48%]">
                        <label htmlFor="lastName" className="lable-style">
                            Last Name
                        </label>
                        
                        <input 
                            type="text" 
                            name="lastName" 
                            id="lastName" 
                            placeholder="Enter Last Name" 
                            className="form-style"  
                            {...register("lastName", {required: true})}
                        />
                    
                        {
                            errors.lastName && <span className=" text-yellow-25">Enter Last Name*</span>
                        }
                    </div>
                </div>

                {/* Email  */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="lable-style">
                        Email Address
                    </label>
                    
                    <input 
                        type="email" 
                        name="email" 
                        id="email" 
                        placeholder="Enter Email Address" 
                        className="form-style"  
                        {...register("email", {required: true})}
                    />
                    
                    {
                        errors.email && <span className=" text-yellow-25">Enter Email Address*</span>
                    }
                </div>

                {/* Message Box */}
                <div className='flex flex-col gap-2'>
                    <label htmlFor="phoneNo" className="lable-style">
                        Phone Number
                    </label>
                    
                    <div className='flex gap-5'>
                        {/* Dropdown */}
                        <div className='flex w-[81px] flex-col gap-2'>
                            <select 
                                type="text" 
                                name="countrycode" 
                                id="countryCode" 
                                className="form-style"
                                {...register("countryCode", {required: true})}>

                                {
                                    countryCode.map( (item, index) => {
                                        return(
                                            <option key={index} value={item.code}>
                                                {item.code} : {item.country}
                                            </option>
                                        )
                                    })
                                }
                            </select>
                        </div>

                        <div className='flex w-[calc(100%-90px)] flex-col gap-2'>
                            <input 
                                type="tel" 
                                name="phoneNo" 
                                id="phonenumber" 
                                placeholder="12345 67890" 
                                className="form-style" 
                                {...register("phoneNo", {required: 
                                {value: true, message: "Please Enter Your Phone Number*"}, 
                                maxLength: {value: 10, message: "Enter a Valid Phone Number*"}, 
                                minLength: {value: 8, message: "Enter a Valid Phone Number*"}})} 
                            />
                            
                            {
                                errors.phoneNo && <span className=" text-yellow-25">{errors.phoneNo.message}</span>
                            }
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="message" className="lable-style">
                            Message
                        </label>
                        
                        <textarea
                            name="message"
                            id="message"
                            cols="30"
                            rows="7"
                            placeholder="Enter your message here"
                            className="form-style"
                            {...register("message", {required: true })}
                        />

                        {
                            errors.message && (<span className="text-yellow-25">Please Enter Your Message*</span>)
                        }
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="rounded-md bg-yellow-50 px-6 py-3 text-center text-[13px] 
                    font-bold text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] 
                    transition-all duration-200 hover:scale-95 hover:shadow-none  
                    disabled:bg-richblack-500 sm:text-[16px] "
                >
                    Send Message
                </button>
            </form> 
        </div>
    )
}

export default ContactUsForm
