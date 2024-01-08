import { asynchHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { response } from "express";

//we have to do acces and refresh token generation again and again so we make a method for it
const genreateAcessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAcessToken();
    const refreshToken = user.generateRefreshToken();
    //refresh token ko database m dalna
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // we do not require the password to be await
    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(
      500,
      "something went wrong while gnereaation access and refrest token"
    );
  }
};

const registerUser = asynchHandler(async (req, res) => {
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
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  //multer gives files excess from the file using middleware
  //   console.log(req.bodyfiles);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //   const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadCloudinary(avatarLocalPath);
  const coverImage = await uploadCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is not uploaded");
  }

  const user = await User.create({
    //databse se baat krne h
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ); //finding user user gid

  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while registring user in backend error"
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

// reqbody-> data
// username or email
// find the user
// password check if user is exist not password check give correct one
// if password correct then generate access and refresh token
// send them in cookies....
const loginUser = asynchHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(email || username)) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, " User not found");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  const { accessToken, refreshToken } = await genreateAcessAndRefreshToken(
    user._id
  );

  //User ko passwor field nhi bhjna uske liye tamjham
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //  sending cookies to user
  const options = {
    httpOnly: true,
    secure: true,
  }; //now the cookies are modifieable only by server....

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken, //this is send if user want the acces to refresh and access token in the case of building an app
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asynchHandler(async (req, res) => {
  // User.findById
  // for getting the user login things for the logging out for that we use middleware
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true, //now he undefinded value milegi
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user LoggedOut Successfully"));
});

const refreshAccessToken = asynchHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  console.log("incoming refresh token is :" + incomingRefreshToken); //The second refresh token is if we are opening  in mobile phone then we have to pass the refresh token in the body  of the req

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    console.log("hello" + user);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if (incomingRefreshToken != user.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }

    const { accessToken, newrefreshToken } = await genreateAcessAndRefreshToken(
      user._id
    );
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("newrefreshToken", accessToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newrefreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token"); //this catch try is not compuslary this is only for extra cautious
  } //now we have described the controller and now we have to give the endpoint to it...
});

const dashboardUser = asynchHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );
  const { username, fullName, email } = user;
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { username, fullName, email },
        "user is loged in so we can see dashboard..."
      )
    );
});

const changeCurrentUserPassword = asynchHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmedPassword } = req.body;

  const user = await User.findById(req.user?._id);
  if (newPassword !== confirmedPassword) {
    throw new ApiError(400, "Confirmed password is not matching ");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed succesfully"));
});

const getCurrentUser = asynchHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "Current user fetched successfully");
});

const updateAccountDetails = asynchHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new Error(400, "All fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    { new: true } //update hone k bad jo value hogi vo return ho jayegiiii.
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated succesfully"));
});

const updateUserAvatar = asynchHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.body._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }.select("-password")
  );
  return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar updated successfully"));
});

const updateUserCoverImage = asynchHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "CoverImage file is missing");
  }

  const coverImage = await uploadCloudinary(coverImageLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading coverImage");
  }

  const user = await User.findByIdAndUpdate(
    req.body._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new:true,
    }.select("-password")
  );
  return res
    .status(200)
    .json(new ApiResponse(200, user, "cover image updated successfully"));
});

const getUserChannelProfile = asynchHandler(async (req, res) => {
  const { username } = req.params; //url se user name nikalna
  console.log(username)
  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }
 

  // User.find({username});
  const channel = await User.aggregate(
    [
      {
        $match: {
          username: username?.toLowerCase(),
        }
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo",
        }
      },
      {
        $addFields: {
          subscribersCount: {
            $size: "$subscribers",
          },
          channerlsSubscribedToCount: {
            $size: "$subscribedTo",
          },
          isSubscribed: {
            $cond: {
              if: {
                $in: [req.user?._id, "$subscribers.subscriber"],
              },
              then: true,
              else: false,
            }
          }
        }
      },
      {
        $project: {
          fullName: 1,
          username: 1,
          subscribersCount: 1,
          channerlsSubscribedToCount: 1,
          isSubscribed: 1,
          avatar: 1,
          coverImage: 1,
          email: 1
        }
      }
    ]
  );
  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists");
  }
  return res
  .status(200)
  .json(
    new ApiResponse(200,channel[0],"User channel fetched successfully")
  )
});

const pusblishVideo= asynchHandler(async(req, res)=>{
  const { title , description } = req.body;

  if (
    [title,description].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const VideoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  console.log(thumbnailLocalPath);
  console.log(VideoLocalPath)
  if (!VideoLocalPath) {
    throw new ApiError(400, "Video file is missing");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail file is missing");
  }
  const uploadedVideo = await uploadCloudinary(VideoLocalPath);
  const thumbnail = await uploadCloudinary(thumbnailLocalPath);
  if (!uploadedVideo) {
    throw new ApiError(400, "Error while uploading avatar");
  }
  if (!thumbnail) {
    throw new ApiError(400, "Error while uploading avatar");
  }


   const owner = await req.user?._id

  const video = await Video.create({
    //databse se baat krne h
    videoFile : uploadedVideo.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration:0,
    isPublished:true,
    owner
  });
  return res
  .status(200)
  .json(
    new ApiResponse(200,video,"User video uploaded")
  )
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  dashboardUser,
  changeCurrentUserPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  pusblishVideo
};
