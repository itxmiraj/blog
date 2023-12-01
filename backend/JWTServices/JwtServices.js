const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/token");
const {Access_Secret_Key,Refresh_Secret_Key} = require("../config/config");
class JwtServices{
    // sign access token
    static signAccessToken(payload,expireTime){
        return jwt.sign(payload,Access_Secret_Key,{expiresIn: expireTime});
    }
    // sign refresh token
    static signRefreshToken(payload,expireTime){
        return jwt.sign(payload,Refresh_Secret_Key,{expiresIn: expireTime});
    }
    // verify access token
    static verifyAccessToken(token){
        return jwt.verify(token,Access_Secret_Key);
    }
    // verify refresh token
    static verifyRefreshToken(token){
        return jwt.verify(token, Refresh_Secret_Key);
    }
    // store refresh token
    static async storeRefreshToken(token , userId){
        try {
            const newToken = new RefreshToken({
                token,
                userId
            })
            // store in db
            await newToken.save();
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = JwtServices