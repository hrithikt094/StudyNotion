import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { course, studentEndpoints } from "../apis";
import rzpLogo from "../../assets/Logo/Logo-Small-Dark.png";
import { resetCart } from "../../slices/cartSlice";
import {setPaymentLoading} from '../../slices/courseSlice';
// import { sendPaymentSuccessEmail, verifySignature } from "../../../server/controllers/Payments";

const {COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API} = studentEndpoints;

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

export async function buyCourse(token, courses, userDetails, navigate, dispatch) {
  const toastId = toast.loading("Loading...");
  try {
    //load the script
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      toast.error("Razorpay SDK failed to load");
      return;
    }

    // initiate the order
    const orderResponse = await apiConnector("POST", COURSE_PAYMENT_API, 
                            {courses},
                            {
                              Authorization: `Bearer ${token}`,
                            });
    
    if(!orderResponse.data.success) {
      throw new Error(orderResponse.data.message);
    }

    console.log('ORDER Response: ', orderResponse);
    console.log('userDetails are: ', userDetails);

    // options
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY,
      currency: orderResponse.data.data.currency,
      amount: `${orderResponse.data.data.amount}`,
      order_id: orderResponse.data.data.id,
      name: "StudyNotion",
      description: "Thankyou for purchasing the course",
      image: rzpLogo,
      prefill: {
        name: `${userDetails.firstName}`,
        email: userDetails.email,
      },
      handler: function(response) {
        // send success mail
        sendPaymentSuccessEmail(response, orderResponse.data.data.amount, token);
        // verifyPayment
        verifyPayment({...response, courses}, token, navigate, dispatch);
      }
    }

    console.log("StudentFeaturesAPI options are: ", options);

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
    paymentObject.on("payment.failed", function(response) {
      toast.error("oops, payment failed");
      console.log(response.error);
    })
  } catch (error) {
    console.log('PAYMENT API ERROR...', error);
    toast.error('Could not make payment');
  }

  toast.dismiss(toastId);
}

async function sendPaymentSuccessEmail(response, amount, token) {
  try {
    await apiConnector("POST", SEND_PAYMENT_SUCCESS_EMAIL_API, {
      orderId: response.razorpay_order_id,
      paymentId: response.razorpay_payment_id,
      amount
    }, {
      Authorization: `Bearer ${token}`
    })
  } catch (error) {
    console.log("PAYMENT SUCCESS EMAIL ERROR....", error);
  }
}

// verify payment
async function verifyPayment(bodyData, token, navigate, dispatch) {
  const toastId = toast.loading("Verifying payment.....");
  dispatch(setPaymentLoading(true));
  try {
    const response = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
      Authorization: `Bearer ${token}`
    })

    if(!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success('Payment successful, you are added to the course');
    navigate('/dashboard/enrolled-courses');
    dispatch(resetCart());
  } catch (error) {
    console.log('PAYMENT VERIFY ERROR...', error);
    toast.error('Could not verify Payment');
  }

  toast.dismiss(toastId);
  dispatch(setPaymentLoading(false));
}















// export async function buyCourse(token, courses, userDetails, navigate, dispatch) {
//   const toastId = toast.loading("Loading...");

//   try {
//     //load the script
//     const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

//     if (!res) {
//       toast.error("Razorpay SDK failed to load");
//       return;
//     }

//     const orderResponse = await createOrder(courses, token);

//     console.log("orderResponse...", orderResponse);

//     //values for options
//     const options = {
//       key: process.env.RAZORPAY_KEY,
//       currency: orderResponse.data.paymentResponse.currency,
//       amount: `${orderResponse.data.paymentResponse.amount}`,
//       order_id: orderResponse.data.paymentResponse.id,
//       name: "StudyNotion",
//       description: "Thank You for Purchasing the course",
//       image: rzpLogo,
//       prefill: {
//         name: `${userDetails.firstName} ${userDetails.lastName}`,
//         email: userDetails.email,
//       },
//       handler: function(response){
//         sendPaymentSuccessEmail(response, orderResponse.data.paymentResponse.amount,token);
//         verifyPayment({ ...response, courses }, token, navigate, dispatch);
//       },
//     };


//     const paymentObject = new window.Razorpay(options);
//     paymentObject.open();
//     paymentObject.on("payment.failed", function(response){
//       toast.error("Could not make payment");
//       console.log(response.error);
//     })
//   } catch (error) {
//     console.log("PAYMENT API ERROR...", error);
//     toast.error("Payment Failed");
//   }

//   toast.dismiss(toastId);
// }

// export const createOrder = async (courses, token) => {
//       //create order
//       const orderResponse = await apiConnector(
//         "POST",
//         paymentEndpoints.COURSE_PAYMENT_API,
//         { courses : courses },
//         { Authorization: `Bearer ${token}` }
//       );
  
//       if (!orderResponse.data.success) {
//         throw new Error(orderResponse.data.message);
//       }

//       return orderResponse;
// }

// export const sendPaymentSuccessEmail = async (response, amount, token) => {
    
//   try {
//     await apiConnector(
//       "POST",
//       paymentEndpoints.PAYMENT_SUCCESS_EMAIL,
//       {
//          orderId: response.razorpay_order_id,
//         paymentId: response.razorpay_payment_id,
//         amount,
//       },
//       {Authorization : `Bearer ${token}`}
//     );
//   } catch (error) {
//     console.log("PAYMENT SUCCESS EMAIL ERROR...", error);
//   }
// };

// export const verifyPayment = async (bodyData, token, navigate, dispatch) => {
//     const toastId = toast.loading("Verifying Payment...");
//     dispatch(setPaymentLoading(true));
//     try{
//         const response = await apiConnector('POST', paymentEndpoints.COURSE_VERIFY_API, bodyData, {
//             Authorization : `Bearer ${token}`
//         });

//         console.log("payment verification response...", response);

//         if(!response.data.success){
//             throw new Error(response.data.message);
//         }

//         toast.success("Payment Successful, You enrolled in the course");

//         navigate("/dashboard/enrolled-courses");
//         dispatch(resetCart());
//     }catch(error){
//         console.log("PAYMENT VERIFICATION ERROR...", error);
//         toast.error("Payment Verification Not Successful");
//     }

//     toast.dismiss(toastId);
//     dispatch(setPaymentLoading(false));
// }