var express = require("express");

var bodyParser = require("body-parser");// allows to access variables in routes
var methodOverride = require("method-override"); //allows us to pass query strings into post request. can specify put and delete request routes
var mongoose = require("mongoose");
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");

var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

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

// var promise = mongoose.connect('mongodb://localhost/scraperarticles2', {
//   useMongoClient: true,
//   /* other options */
// });

mongoose.connect(process.env.MONGODB_URI);
var db = mongoose.connection;
// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});
// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

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


      result.push({
        title: title,
        link: link
      });



      var bulk = Article.collection//.insertMany(result);
      // bulk.insert[result];

      bulk.insertMany(result);
      

    });

   
  });
  // Tell the browser that we finished scraping the text
  res.send("Scrape Complete");
});

//This will get the articles we scraped from the mongoDB
app.get("/", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      // res.json(doc);
      console.log(doc);
       res.render( "index", {articles: doc} );
    }
  });
});

app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any erro    if (error) {
      if (error) {
        console.log(error);
      }
    // Or send the doc to the browser as a json object
    else {
       res.json(doc);
      //res.render( " index", {articles : doc} );
    }
  });
});



// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json( "index", {docs : doc});
    }
  });
});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);
  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});

var PortVar = process.env.PORT || 3000;

// Listen on port 3000
app.listen(PortVar, function() {
  console.log("App running on port 3000!");
});
