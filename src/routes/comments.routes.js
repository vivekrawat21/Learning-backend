import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    addComment,
    updateComment,
    deleteComment,
    getAllcommentsofUser,
    getAllcommentsofVideo
 } from "../controllers/comment.controller.js"

const router = Router();

router.use(verifyJWT);
router.route('/:videoId').post(addComment).get(getAllcommentsofVideo);
router.route('/:commentId').delete(deleteComment)
.put(updateComment);
router.route('/').get(getAllcommentsofUser)


export default router;