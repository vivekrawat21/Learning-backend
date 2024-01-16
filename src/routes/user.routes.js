import { Router } from "express";
import {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken,
   dashboardUser,
   changeCurrentUserPassword,
   updateAccountDetails,
   updateUserAvatar,
   updateUserCoverImage,
   getUserChannelProfile,
   pusblishVideo,getCurrentUser,
   getWatchHistoy
  } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route('/register').post( //jaate hue milkr jana middle ware
    upload.fields([
   {
    name :"avatar",
    maxCount : 1
     },
     {
       name :"coverImage",
       maxCount : 1
     }
    ]),
    registerUser
    )

router.route("/login").post(loginUser);


// secured routes
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);  //no need for this 
router.route("/dashboard").post(verifyJWT,dashboardUser);
router.route("/update-password").post(verifyJWT,changeCurrentUserPassword);
router.route("/update-user-details").patch(verifyJWT,updateAccountDetails);
router.route("/current-user").post(verifyJWT,getCurrentUser);
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar);
router.route("/update-cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage);
router.route("/c/:username").get(verifyJWT,getUserChannelProfile);
router.route("/history").get(verifyJWT,getWatchHistoy)

router.route('/upload').post( //jaate hue milkr jana middle ware
    upload.fields([
   {
    name :"videoFile",
    maxCount : 1
     },
     {
       name :"thumbnail",
       maxCount : 1
     }
    ]),
    verifyJWT,
    pusblishVideo
    )
export default router;