const Joi = require("joi");
const User = require("../models/users");
const bcrypt = require("bcryptjs");
const DTO = require("../DTO/dto");
const JwtServices = require("../JWTServices/JwtServices")
const RefreshToken = require("../models/token");
const jwt = require("jsonwebtoken");

const passwordPattern = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*-]).{8,}$/;
const authController = {
    async register(req, res, next) {
        // Validate Input
        const userRegisterSchema = Joi.object({
            name: Joi.string().min(4).max(30).required(),
            username: Joi.string().alphanum().min(6).required(),
            password: Joi.string().pattern(
                passwordPattern
            ).required(),
            email: Joi.string().email().required(),
            confirmpassword: Joi.ref('password')
        });
        const { error } = userRegisterSchema.validate(req.body);
        if (error) {
            return next(error);
        }
        // if email already exists
        const { username, password, email, name } = req.body;
        try {
            const emailInuse = await User.exists({ email });
            const usernameInuse = await User.exists({ username });
            if (usernameInuse) {
                const error = {
                    status: 409,
                    message: "Username already in use use another one"
                }
                return next(error);
            }
            if (emailInuse) {
                const error = {
                    status: 409,
                    message: "Email already in use try another one"
                }
                return next(error);
            }
        }
        catch (error) {
            next(error);
        }
        // Hashing
        try {
            const HashedPassword = await bcrypt.hash(password, 10);
            // Store in DB
            const userToResgister = new User({
                username,
                name,
                email,
                password: HashedPassword,
            });
            const user = await userToResgister.save();

            const accessToken = JwtServices.signAccessToken({_id : user._id }, 
                '30m'
            );
            const refreshToken = JwtServices.signRefreshToken({_id : user._id}, '60m' );
            res.cookie('accessToken' , accessToken , {
                maxAge : 1000 * 60 * 60 * 24,
                httpOnly: true
            })
            res.cookie('refreshToken', refreshToken , {
                maxAge : 1000 * 60 * 60 * 24,
                httpOnly: true
            });
            await JwtServices.storeRefreshToken(refreshToken,user._id);
    
            const userDTO = new DTO(user);
            return res.status(201).json({ user : userDTO  , auth:true});
  
        }
        catch (error) {
            next(error);
        }

      

    },
    async login(req, res, next) {
        // Validate Userr Input
        const userLoginSchema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().pattern(passwordPattern).required()
        })
        const { error } = userLoginSchema.validate(req.body);
        // If validation error return error
        if (error) {
            return next(error);
        }
        // match username password
        const { email, password } = req.body;
        // email = req.body.email

        try {
            const emailMatch = await User.findOne({ email });
            if (!emailMatch) {
                let error = {
                    status: 401,
                    message: "Invalid Username"
                }
                return next(error);
            }
            const passwordMatch = await bcrypt.compare(password, emailMatch.password);
            if (!passwordMatch) {
                let error = {
                    status: 401,
                    message: "Invalid Password"
                }
                return next(error);
            }
            const accessToken = JwtServices.signAccessToken({_id: emailMatch._id} , '30m');
            const refreshToken = JwtServices.signRefreshToken({_id:emailMatch._id}, '60m');
            res.cookie('accessToken', accessToken,{
                maxAge: 1000*60*60*24,
                httpOnly:true
            });
            res.cookie('refreshToken', refreshToken,{
                maxAge: 1000*60*60*24,
                httpOnly:true
            });
            // update refresh token in db
            await RefreshToken.updateOne({
                _id : emailMatch._id
            },{
                token: refreshToken,
            },{
                upsert: true
            })
            const userDTO = new DTO(emailMatch);
            return res.status(200).json({ user: userDTO , auth: true });
        }
        catch (error) {
            return next(error);
        }
    },

    async logout (req,res,next){
        // console.log(req);
        // delete refresh token from db
        try {
            const {refreshToken} = req.cookies;
            await RefreshToken.deleteOne({token : refreshToken});
        } catch (error) {
            return next(error)
        }
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        // send response
        res.status(200).json({user : null , auth: false});
    },
    async refresh(req,res,next){
        // get refresh token
        const orignalRefreshToken = req.cookies.refreshToken;
        // verify refresh token
        try {
            if(!orignalRefreshToken){
                let error = {
                    status : 401,
                    message : "Unauthorized"
                }
                return next(error);
            }
            const id = JwtServices.verifyRefreshToken(orignalRefreshToken)._id;
            if(!id){
                let error = {
                    status : 401,
                    message : "Unauthorized"
                }
                return next(error);
            }
            // assign access n refresh token
            const accessToken = JwtServices.signAccessToken({_id : id}, '30m');
            const refreshToken = JwtServices.signRefreshToken({_id: id}, '60m');
            res.cookie("accessToken",accessToken,{
                maxAge: 1000*60*60*24,
                httpOnly:true
            });
            res.cookie("refreshToken",refreshToken,{
                maxAge: 1000*60*60*24,
                httpOnly:true
            });
            // update tokens in db
            await RefreshToken.updateOne({_id: id}, {token: refreshToken});
            const user = await User.findOne({_id: id});
            const userDTO = new DTO(user);
            return res.status(200).json({user: userDTO , auth:true});
        } catch (error) {
            return next(error);
        }
    }
};

module.exports = authController;