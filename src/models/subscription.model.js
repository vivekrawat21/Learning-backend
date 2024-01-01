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
