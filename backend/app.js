const express = require("express");
const app = express();
const { PORT } = require("./config/config");
const dbConn = require("./database/connection");
const router = require("./routes/router");
const cookie = require("cookie-parser");
const errorHandler = require("./midllewares/errorHandler"); // Corrected typo in the middleware import

// use cookies for website

app.use(cookie());

// Use express.json() middleware to parse incoming JSON requests
app.use(express.json());

// Use your router
app.use(router);

// For images to be accessed globally
app.use("/localStorage" , express.static('localStorage'));

// Connect to the database
dbConn();

// Use your error handler middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => console.log(`Running at port ${PORT}`));
