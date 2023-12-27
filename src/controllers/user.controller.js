import { asynchHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asynchHandler( async (req, res) => {
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

export { registerUser };
