import { Tweet } from '../models/tweet.model.js';
import { User} from '../models/user.model.js';
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

const getUserTweets =(asynchHandler(async(req,res)=>{
     const { userId } = req.params;
     console.log(userId);
     if(userId.trim()==''){
   throw new ApiError(400,"Please enter a user in the params");
     }
     const user = await User.findById(userId);
     const tweets = await Tweet.find({
      owner:userId
     })
     if(tweets==''){
      throw new ApiError(400,`no tweet found of user ${user.username} `);
     }
     
     return res.status(200).json(new ApiResponse(200,tweets, `all tweets fetched successfully of user ${userId}  `))
}))

  const updateTweet = asynchHandler(async(req,res)=>{
    const { content } = req.body;
    const { tweetId } = req.params;
    if(tweetId.trim()==''){
      throw new ApiError(400,"Please enter a tweet in the params");
    }
    // if(content.trim()=""){
    //   throw new ApiError(400, "Please enter some content to update")
    // }
    const tweet = await Tweet.findByIdAndUpdate(
      tweetId,
      {
        $set :{
          content
        }
      },
      {
        new:true
      }
    )
    if(!tweet){
      throw new ApiError(400,"No tweet found ");
    }
    return res.status(200).json(new ApiResponse(200,tweet,"Tweet updated successfully"));
  });
   
  const deleteTweet = asynchHandler(async(req,res)=>{
    const { tweetId } = req.params;
    if(tweetId.trim()==''){
      throw new ApiError(400,"Please enter a tweet in the params");
    }
    // if(content.trim()=""){
    //   throw new ApiError(400, "Please enter some content to update")
    // }
    const tweet = await Tweet.findByIdAndDelete(
      tweetId
    )
    if(!tweet){
      throw new ApiError(400,"No tweet found ");
    }
    return res.status(200).json(new ApiResponse(200,tweet,"Tweet deleted successfully"));
  });
    
export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
//Some ToDOs: first only the user who's tweet is can delete and update the tweet only 