import { Router } from "express";
import { createTweet
    // ,getUserTweet
    // ,updateTweet
    // ,deleteTweet
}
from "../constants/tweets.controller.js";

const router = Router();
router.route('/').post(createTweet);

export default router;