import { asynchHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const publishVideo = asynchHandler(async (req, res) => {
  const { title, description } = req.body;

  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const VideoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  // console.log(thumbnailLocalPath);
  // console.log(VideoLocalPath)
  if (!VideoLocalPath) {
    throw new ApiError(400, "Video file is missing");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail file is missing");
  }
  const uploadedVideo = await uploadCloudinary(VideoLocalPath);
  const thumbnail = await uploadCloudinary(thumbnailLocalPath);
  if (!uploadedVideo) {
    throw new ApiError(400, "Error while uploading  video to cloudiary");
  }
  if (!thumbnail) {
    throw new ApiError(400, "Error while uploading thumbnail to cloudiary");
  }

  const owner = await req.user?._id;
  const username = await req.user?.username;
  const duration = uploadedVideo.duration;

  const video = await Video.create({
    //databse se baat krne h
    videoFile: uploadedVideo.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration,
    isPublished: true,
    owner,
    username: username,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, video, "User video uploaded"));
  //todos optimize the video uploads and how to get values from the cloudinary
});

const getAllVideos = asynchHandler(async (req, res) => {
  const owner = await User.findById(req?.user?._id);

  // console.log(owner)
  const videos = await Video.find({
    owner,
  });
  console.log(videos);
  if (!videos) {
    throw new ApiError(404, "no videosfound");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "videos fetched successfully"));
});

const getVideoById = asynchHandler(async (req, res) => {
  const { videoId } = req.params;
  // console.log(videoId);
  if (!videoId.trim()) {
    throw new ApiError(400, "username is missing");
  }
  const video = await Video.findById(videoId).select("-isPublished");

  if (!video) {
    throw new ApiError(404, "no videosfound");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "video fetched successfully"));
});

const deleteVideo = asynchHandler(async (req, res) => {
  const { videoId } = req.params;
  // console.log(videoId);
  if (!videoId.trim()) {
    throw new ApiError(400, "username is missing");
  }
  try {
    const video = await Video.findByIdAndDelete(videoId);
  } catch (error) {
    console.error(`Error deleting video with ID ${videoId}:`, error);
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "videos " + videoId + " deleted successfully")
    );
});

const updateVideo = asynchHandler(async (req, res) => {
  const { videoId } = req.params;
  const thumbnailLocalPath = req.file?.path;

  if (!thumbnailLocalPath) {
    throw new Error(
      400,
      "thumbnail is required"
    );
  }

  // console.log(thumbnailLocalPath);
  const thumbnail = await uploadCloudinary(thumbnailLocalPath);
  if(!thumbnail.url) {
    throw new ApiError(400, "Error while uploading thumbnail");
  }
  // console.log(thumbnail.url);
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        thumbnail: thumbnail.url,
      }
    },
    {
      new: true,
    }
  ).select('-isPublished');

  if(!video){
    throw new ApiError(400,"No Video Found!!")
  }
  res
    .status(200)
    .json(new ApiResponse(200, video, "video updated successfully"));
});
export { publishVideo, getAllVideos, getVideoById, deleteVideo, updateVideo };
