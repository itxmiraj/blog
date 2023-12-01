const mongoose = require("mongoose");

const {Schema} = mongoose;

const tokenSchema = Schema({
    token: {type: String , required : true},
    userId: {type : mongoose.Schema.Types.ObjectId , ref:'users'}
});

module.exports = mongoose.model("RefreshToken" , tokenSchema , "tokens");