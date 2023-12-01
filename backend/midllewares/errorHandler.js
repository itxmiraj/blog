const {ValidationError} = require("joi");
const errorHandler = (error,req,res,next)=> {
    let status = 500;
    let data = {
        message : "Internal Server Error"
    }
    if (error instanceof ValidationError){
        status = 401;
        data.message = error.message;
        return res.status(status).json(data);
    }
    if(error.status){
        status = error.status;
    }
    // if(error.message === "\"password\" with value \"miraj-1222\" fails to match the required pattern: /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/"){
    //     error.message = "Password should have special Characters , Numbers and Alphabets with minimum length of 8";
    //     return res.status(status).json(data);
    // }
    if(error.message){
        data.message = error.message;
    }
    return res.status(status).json(data);
}
module.exports = errorHandler;