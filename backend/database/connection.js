const mongoose = require('mongoose');
const { Mongo_Conn } = require('../config/config');

const dbConn = async () => {
  try {
    await mongoose.connect(Mongo_Conn);
    console.log('Database connected');
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
  }
};

module.exports = dbConn;
