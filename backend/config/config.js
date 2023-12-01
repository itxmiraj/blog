require("dotenv").config();

const PORT = process.env.PORT;
const Mongo_Conn = process.env.Mongo_Conn;
const Access_Secret_Key = process.env.Access_Secret_Key;
const Refresh_Secret_Key = process.env.Refresh_Secret_Key;
const BACKEND_SERVER_HOST = process.env.BACKEND_SERVER_HOST
module.exports = {PORT , Mongo_Conn , Access_Secret_Key , Refresh_Secret_Key ,BACKEND_SERVER_HOST}