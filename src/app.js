import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
));

//security practices
app.use(express.json(
   { limit:"16kb"}
));//This will be used to accept the json from the frontend or from anywhere



//for  taking data from url
//url have encoder so for that we have to use configuration
app.use(express.urlencoded({extended:true,limit:"16kb"})); //extended forthe object ke andar object
app.use(express.static("public"));  //for images and pdf vagerah

// For using the cookies from the user browser we use cookies parser and perform crud operation on cookies of user browser
app.use(cookieParser());  //for cookies


//routes import
import  userRouter from './routes/user.routes.js';
import videoRouter from './routes/video.routes.js';

//routes declaration
// app.get is used when we use do not have  the routers now we use the middleware for that .
app.use("/api/v1/users",userRouter); 
// app.get("/api/v1/users/register",(req, res, next) =>{
//     res.send("hello user")
// })

// app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
// app.use("/api/v1/tweets", tweetRouter)
// app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
// app.use("/api/v1/comments", commentRouter)
// app.use("/api/v1/likes", likeRouter)
// app.use("/api/v1/playlist", playlistRouter)
// app.use("/api/v1/dashboard", dashboardRouter)

// http://localhost:8000/users/register the use url will become prefix


export { app };

