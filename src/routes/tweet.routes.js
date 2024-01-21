import { Router } from "express";
import { createTweet
    // ,getUserTweet
    // ,updateTweet
    // ,deleteTweet
}
from "../controllers/tweets.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.route('/').post(createTweet);

export default router;