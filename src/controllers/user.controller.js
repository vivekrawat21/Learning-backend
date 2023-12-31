import { asynchHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from  "jsonwebtoken"

//we have to do acces and refresh token generation again and again so we make a method for it 
const genreateAcessAndRefreshToken = async(userId)=>{
try{
  const user = await User.findById(userId);
  const accessToken = user.generateAcessToken();
  const refreshToken = user.generateRefreshToken();
  //refresh token ko database m dalna
  user.refreshToken = refreshToken;
  await user.save({validateBeforeSave: false}); // we do not require the password to be await
  return {accessToken, refreshToken};
}
catch(err){
  throw new ApiError(500, "something went wrong while gnereaation access and refrest token");

}
}

const registerUser = asynchHandler(async (req,res) => {
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

  const { fullName, email, username, password } = req.body;

  // if (fullName===""){
  //     throw new ApiError(400,"fullname is required");
  // } new tarikka
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({
    // operators
    $or: [{ username }, { email }],
  })
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  //multer gives files excess from the file using middleware
//   console.log(req.bodyfiles);
  const avatarLocalPath = req.files?.avatar[0]?.path;
//   const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadCloudinary(avatarLocalPath);
  const coverImage = await uploadCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is not uploaded");
  }

const user =  await  User.create({  //databse se baat krne h
    fullName,
    avatar : avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username : username.toLowerCase()
  }) 
  const createdUser = await User.findById(user._id).select(
   "-password -refreshToken"
  ); //finding user user gid

  if(!createdUser){
    throw new ApiError(500, "Something went wrong while registring user in backend error");
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser ,"User Registered Successfully")
  )
});


// reqbody-> data
// username or email 
// find the user
// password check if user is exist not password check give correct one
// if password correct then generate access and refresh token
// send them in cookies....
const loginUser = asynchHandler(async(req, res)=>{
  const {email , username , password} = req.body;

  if(!(email || username)){
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
   $or: [{username},{email}]

  })

  if (!user){
    throw new ApiError(404, " User not found");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid){
    throw new ApiError(401, "Invalid user credentials");
  }
 const {accessToken , refreshToken} = await genreateAcessAndRefreshToken(user._id);
  
 //User ko passwor field nhi bhjna uske liye tamjham
 const loggedInUser = await User.findById(user._id).select("-password -refreshToken");


//  sending cookies to user
 const options ={
  httpOnly: true,
  secure : true
 } //now the cookies are modifieable only by server....

 return res
 .status(200)
 .cookie("accessToken", accessToken,options)
 .cookie("refreshToken", refreshToken,options)
 .json(
  new ApiResponse(
    200,
    {
    user : loggedInUser , accessToken , refreshToken  //this is send if user want the acces to refresh and access token in the case of building an app
  },
  "User logged in successfully"
  )
 )
 

});


const logoutUser = asynchHandler(async (req,res) => {

  // User.findById 
  // for getting the user login things for the logging out for that we use middleware
  await User.findByIdAndUpdate(
    req.user._id,{
    $set : {
      refreshToken : undefined
    }
  } ,
  {
    new : true //now he undefinded value milegi
  }

  )
  const options ={
    httpOnly: true,
    secure : true
   } 
   return res
   .status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new ApiResponse(200,{},"user logged out Succcessfully"));

})

const refreshAccessToken = asynchHandler(async (req,res)=>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken ; //The second refresh token is if we are opening  in mobile phone then we have to pass the refresh token in the body  of the req 
  if (incomingRefreshToken)
{
   throw new ApiError (401,"Unauthorized request");
}

 try {
  const decodedToken = jwt.verify(
   incomingRefreshToken
   ,process.env.REFRESH_TOKEN_SECRET
  )
 
   const user = await User.findById(decodedToken?._id);
 
   if(!user){
     throw new ApiError(401, "Invalid refresh token")
   }
   if(incomingRefreshToken !== user.refreshToken){
     throw new ApiError(401,"refresh token is expired or used");
 
   }
    
   const {accessToken,newrefreshToken}=await genreateAcessAndRefreshToken(user._id);
   const options = {
     httpOnly: true,
     secure: true
   }
 
   return res
   .status(200)
   .cookie("accessToke",accessToken,options)
   .cookie("newrefreshToken",accessToken,options)
   .json(
     new ApiResponse(200,
       {accessToken, 
       refreshToken : newrefreshToken
       },
       "Access token refreshed successfully"
     )
   )
 
 } catch (error) {
  throw new ApiError(401,error?.message || "invalid refresh token");  //this catch try is not compuslary this is only for extra cautious
  
 }//now we have described the controller and now we have to give the endpoint to it...
})


export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
};
