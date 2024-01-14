import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, //One who is subscribing....
      ref: "User",
    },
    channel: {
      //One to whom subscriber is subsribing..
      type: Schema.Types.ObjectId, //One who is subscribing....
      ref: "User",
    },

  },
  
  {
    timestamps: true,
  }
 
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
//subscription schema :
//How it actually works
//Contains two major things 
// 1. Subscribers  2.Channels
//when the code run in every  a new document will created
//So we can say that everyone can subcribe to different channels and many channels can subscribe to same channel
//For getting the subscriber count we will count the document which have channel of the youtube name so we count the documnet which have the channel name 
// when we want to check which channel do i have subscribed for that we  selected the document where subscriber value is i and get the channel name for my every document .
