//-------------------------DEPENDENCIES------------------
const express = require("express");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const logger = require("morgan")
const bodyParser = require("body-parser")
const axios = require("axios")

//Require all models
const db = require("./models")

const PORT = process.env.PORT || 3000;

//Initialize express
const app = express();
//const router = express.Router();

//require("./config/routes")(router);

//Configure middleware
//Use Morgan for logging requests
app.use(logger("dev"));

//body-parser will handle form submissions
app.use(bodyParser.urlencoded({ extended: true }));

//Set a static directory
app.use(express.static("public"));

//Set handlebars as the app engine
app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));

app.set("view engine", "handlebars");

//app.use(router);

// If deployed, use the deployed database. Otherwise use the local mongoheadlines
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoheadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

app.listen(PORT, function(){
    console.log("Listening on port: " + PORT)
});
