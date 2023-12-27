import {asynchHandler} from '../utils/asyncHandler.js';

const registerUser = asynchHandler(async(req,res)=>{

    // steps for getting details form the user
    // 1. Get the details of user from the get request of user
    // 2. validation for the details -not empty
    // 3. check if ussr already exists: check from email/username
    // 4. check for the images and check for the avatar....
    // 5. uploaad them to cloudnary if the user upload it
    // 6. create user object - create entry in db
    // 7. remove password and rfresh token field from reponse..
    // 9. check for the user creation 
    // 10. return response

    res.status(200).json({
        message : "hello user"
    })

    const {fullName,email,userName,password}=req.body;
    console.log("email: " + email);
    console.log("password: " );
});

export {
    registerUser
};