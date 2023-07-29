import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const API_URL =
  "https://api.sportsdata.io/v3/nba/scores/json/Players?key=ebf007de2c834bf6b2be8e153fb6a85d";

//name of players that the users type in
var playerGuesses = [];
//index of the players that the users type in
var index = [];

//all active player names
var Name = [];
//all active player ids
var ID = [];

//random player that user is trying to guess
var randomPlayer = [];

var searchInfo = [];

//var guessEndpoint = "";

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async function (req, res) {
  try {

    //JSON results from the API URL
    const result = await axios.get(API_URL);

    let random = Math.floor(Math.random() * result.data.length);

    //separating player names and ids
    for (var i = 0; i < result.data.length; i++) {
      var fullName = result.data[i].FirstName + " " + result.data[i].LastName;
      Name.push(fullName.toLowerCase());
      ID.push(result.data[i].PlayerID);
    }

    //random player that user is trying to guess
     randomPlayer = result.data[random];
    //console.log(randomPlayer);



    //console.log(result.data.length);
    res.render("index.ejs", { rPlayer: JSON.stringify(randomPlayer), gPlayer: searchInfo});
  } catch (error) {
    res.render("index.ejs", { content: JSON.stringify(error.response.data) });
  }
});

app.post("/", async function (req, res) {
  var g = req.body.Typeguess;
  
  
 

  console.log(searchInfo);

    if (Name.includes(g.toLowerCase())) 
    {

      console.log("true");
      playerGuesses.push(g);
      index.push(Name.indexOf(g));
      //console.log(index);
    //   console.log(Name[index]);
    const guessResultInfo = await axios.get("https://api.sportsdata.io/v3/nba/scores/json/Player/" + ID[Name.indexOf(g)] + "?key=ebf007de2c834bf6b2be8e153fb6a85d");

   

 var array = [
    JSON.stringify(guessResultInfo.data.Team),
    "conference",
    JSON.stringify(guessResultInfo.data.Height),
    JSON.stringify(guessResultInfo.data.Weight),
    JSON.stringify(guessResultInfo.data.Experience),
    JSON.stringify(guessResultInfo.data.Jersey),
    JSON.stringify(guessResultInfo.data.DepthChartPosition)
 ];

 searchInfo.push(array);
 console.log(searchInfo);
      res.redirect("/");
    } 
    else 
    {
      console.log("false");
    //   alert("We could not find that player. Please try again.");
    }
});

app.listen(port, function (req, res) {
  console.log("Server listening on port " + port);
});
