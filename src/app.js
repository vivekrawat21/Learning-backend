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
app.use(cookieParser);  //for cookies

export { app };

