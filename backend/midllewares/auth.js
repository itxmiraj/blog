const JwtServices = require("../JWTServices/JwtServices");
const User = require("../models/users");
const DTO = require("../DTO/dto");
const auth = async (req,res,next)=>{
    try {
        const {refreshToken , accessToken } = req.cookies;
        if (!refreshToken || !accessToken){
            let error = {
                status : 401,
                message : "Unauthorized"
            }
            return next(error);
        }
        const _id =  JwtServices.verifyAccessToken(accessToken)._id;
        const user = await User.findOne({_id:_id});
        const userDTO = new DTO(user);
        req.user = userDTO;
        next();
    } catch (error) {
       return next(error);
    }
 
}

module.exports = auth;