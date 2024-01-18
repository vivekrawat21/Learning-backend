import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
     publishVideo,
     getAllVideos
    } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
.get(getAllVideos)
.post(
 //jaate hue milkr jana middle ware
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
    publishVideo
    );

// router.route("/:videoId")
// .get(getVideoById)
// .delete(deleteVideo)
// .patch(upload.single("thumbnail"),updateVideo)

export default router;