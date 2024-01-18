import { asynchHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const healthCheck = asynchHandler(async (req,res)=>{
  
    return res.
    status(200)
    .json(new ApiResponse(200,{},"health is ok"))

});

export {healthCheck}
