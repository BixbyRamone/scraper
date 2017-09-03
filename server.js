var express = require("express");

var bodyParser = require("body-parser");// allows to access variables in routes
var methodOverride = require("method-override"); //allows us to pass query strings into post request. can specify put and delete request routes
var mongojs = require("mongojs");
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");

var app = express();

// Override with POST having ?_method=DELETE
app.use(methodOverride("_method")); // necessary?
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/scraperarticles");

//============================Get Articles=====================

app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("https://chasmosaurs.blogspot.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
     $('h3.post-title').each(function(i, element){

      // Save an empty result object
      var result = [];

      // Add the text and href of every link, and save them as properties of the result object
      var title = $(this).children("a").text();
      var link = $(this).children("a").attr("href");

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      // var entry = new Article(result);
            // var entryArray = [];

      result.push({
        title: title,
        link: link
      });

      var bulk = Article.collection.insertMany(result);
      // bulk.insert[result];


      // console.log(entryArray);

      // entry.collection.insert


      // Now, save that entry to the db
      

    });

   
  });
  // Tell the browser that we finished scraping the text
  res.send("Scrape Complete");
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});



// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
