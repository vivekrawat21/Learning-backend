const asynchHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  }
}

export { asynchHandler};

//using try catch
// const asyncHandler = ()=>{}
// const asyncHandler = (funct) =>()=>{}
// const asyncHandler = (funct) =>async ()=>{}

// const asyncHandler =(fn)=> async(req,res,next)=>{
//    try{
//     await fn(req,res,next);
//    }
//    catch(err){
//     res.status(err.code || 500 ).json({
//         success :false,
//         message :err.message
//     })
//    }
// }
