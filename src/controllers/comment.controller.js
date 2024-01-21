import { asynchHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, {isValidObjectId} from "mongoose"

const addComment = asynchHandler(async (req, res) => {
  const { content } = req.body;
  const owner = req.user?._id;
  const videoId = req.params.videoId;
  if (!content) {
    throw new ApiError(400, "Enter some content on the comment first");
  }

 const video = await Video.findById(videoId);
 const title = video.title;
  if (!video) {
    throw new ApiError(400, "video not found");
  }

  const comment = await Comment.create({
    //database se baat krna
    content: content,
    video: video,
    owner: owner,
  });
  return res.
  status(200).
  json(new ApiResponse(200,comment,`Comment added successfully to video:  ${title}`));
});
 
   const getAllcommentsofUser = asynchHandler(async (req, res) => {
    const owner = req.user?._id;
    const comments = await Comment.find({
        owner 
    })  
  if (!comments) {
    throw new ApiError(400,`no comments found of the user ${owner.username}` );
  }

  return res.
  status(200).
  json(new ApiResponse(200,comments ,"comments fetched successfully"));
   });
  const updateComment = asynchHandler(async (req, res) => {
      const {commentId} = req.params;
      const { content } = req.body;
      if(!commentId){
        throw new ApiError(400,"comment id not found in the params");
      }
      const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{

                content
             }
        },
        {
            new:true
        }
      )
      if (!comment){
        throw new ApiError(400,"no comment  found of login user ");
      }
      return res.status(200).json(new ApiResponse(200,comment,"comment updated successfully"));
  });

  const deleteComment = asynchHandler(async(req,res)=>{
    const { commentId } = req.params;
    const comment = await Comment.findByIdAndDelete(commentId);
    if(!commentId){
      throw new ApiError(400,"comment id not found in the params");
    }
    return res.
    status(200).
    json(new ApiResponse(200,comment,"comment deleted successfully..."));
  });

  const getAllcommentsofVideo = asynchHandler(async(req,res)=>{
    const {videoId} = req.params;
    const videoIdcheck = await Video.findById(videoId);
    if(!videoIdcheck){
      throw new ApiError(400,"video id not found in the database");
    }
    const comment = await Comment.find(
      {
      video : videoId
    }
      );

      if(!comment){
        throw  new ApiError(400,"No comment found on this video")
      }

    return res.status(200).json(new ApiResponse(200,comment," All comments fetched succesfully of this video"));
  })

export {
     addComment,
     updateComment,
     deleteComment,
     getAllcommentsofUser,
     getAllcommentsofVideo
     };
