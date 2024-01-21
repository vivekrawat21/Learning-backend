import { Tweet } from '../models/tweet.model.js';
import { asynchHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const createTweet = asynchHandler(async(req,res)=>{
   const { content } = req.body;
   const owner = req.user?._id;

   if(!content){
    throw new ApiError(400,"Please enter some content to tweet");
   }
   const tweet = await Tweet.create({
     owner,
     content
   });
  
   return res.status(200).json(new ApiResponse(200,tweet,"Tweet created successfully"));

});
   
    
export {
    createTweet
}
