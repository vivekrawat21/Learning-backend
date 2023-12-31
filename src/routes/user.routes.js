import { Router } from "express";
import { registerUser,loginUser,logoutUser,refreshAccessToken,dashboardUser,changeCurrentUserPassword,updateAccountDetails,updateUserAvatar,updateUserCoverImage,getUserChannelProfile,pusblishVideo} from "../controllers/user.controller.js";
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
router.route("/update-user-details").post(verifyJWT,updateAccountDetails);
router.route("/update-avatar").post(verifyJWT,updateUserAvatar);
router.route("/update-cover-image").post(verifyJWT,updateUserCoverImage);
router.route("/profile/:username").post(getUserChannelProfile);

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