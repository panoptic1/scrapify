//-------------------------DEPENDENCIES------------------
const express = require("express");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const logger = require("morgan")
const bodyParser = require("body-parser")
const axios = require("axios")
const cheerio = require("cheerio")

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

//Create a shorthand app for the mongoose connection
const db = mongoose.connection

//Display any mongoose errors
db.on('error', function(err){
    console.log('Mongoose Error: ' + err)
})

//Log a success message if a connection is made.
db.once('open', function() {
    console.log('Mongoose connection successful.');
});

//Require all models
const models = require("./models/index")

//================================ROUTES===================================

app.get("/scrape", function(req, res) {

    axios.get("https://www.nytimes.com").then(function(response) {
        
        var $ = cheerio.load(response.data);

        $('article').each(function(i, element) {

            let result = {};

            result.title = $(this).find('h2').text().trim();
            result.link = $(this).find('h2').children('a').attr('href');
            result.summary = $(this).find('.summary').text().trim();

            // TO DO - ADD VALIDATION BEFORE CREATING THE OBJECT
            // result.title = title;
            // result.link = link;
            // result.summary = summary;
            models.Article.create(result)
                .then(function(dbArticle) {
                    console.log(dbArticle);
                }).catch(function(err) {
                    console.log(err);
                });
        });
        res.send("scrape complete!");
    });
}); 

app.get("/api/articles", function(req, res) {
    models.Article.find({})
        .then(function(dbArticles) {
            res.json(dbArticles);
        }).catch(function(err) {    
            return console.log(err);
        });
});

app.get("/", function(req, res) {
    // retrieve all scraped articles from the database
    models.Article.find({})
        .then(function(dbArticles) {
            res.render("index", {articles: dbArticles});
        }).catch(function(err) {
            res.json(err);
        });
    // res.render("index", );
});


  // Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.listen(PORT, function(){
    console.log("Listening on port: " + PORT)
});
