// require('dotenv').config({path:'./env'}); it is lacking in code consistency
import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import { app } from './app.js';
dotenv.config({
    path:'./.env' //This is the better approach for code 
});


let port = process.env.PORT||5000;


connectDB()
.then(()=>{
    app.listen(port,()=>{
        console.log('listening on port: '+ port);
    })
})
.catch((err) => {
    console.log("MongoDB connection faile!!" + err);
});









/* -----FIRST APPOACH FOR DATABASE CONNECTION---------
import express from "express";
//Wrap the database connection into try catch or promises 
//Database is always in another continent so time lagega and we have to use async await

const app = express();


(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`); //we have to give the database name and the url of the database
        app.on("error",(error)=>{
            console.log("ERR: ",error)
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log("App is listening on port:  ",process.env.PORT);
        })
    }
    catch(error){
        console.error(error);
        throw error
    }
})(); //ifise is  used to execute the function immediately*/