import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const API_URL =
  "https://api.sportsdata.io/v3/nba/scores/json/Players?key=ebf007de2c834bf6b2be8e153fb6a85d";

var numberOfguesses = 0;
var numberRemaining = 20;

var correctGuess = [];
var correctTeam = [];
var correctConference = [];
var correctHeight = [];
var correctWeight = [];
var correctExperience = [];
var correctJersey = [];
var correctPosition = [];
var correctCollege = [];

//name of players that the users type in
var playerGuesses = [];

//index of the players that the users type in
var index = [];

//info about all team
var teamInfo;

//all active player names
var Name = [];
//all active player ids
var ID = [];

//random player that user is trying to guess
var randomPlayer = [];

var random = -1;

//all info of the player that the user typed in
var searchInfo = [];

//checking to see if random player is created
var createRandom = false;

var randomPlayerInfo = [];

//player team abreviation
var team = "";
var Rteam = "";

//player team full name
var newTeam = "";
var RnewTeam = "";

//conference of the team
var conference = "";
var Rconference = "";

//team logo
var logo = "";
var Rlogo = "";

var gameOver = false;
var gameOverMessage = "";

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async function (req, res) {
  try 
  {
    //JSON results from the API URL
    const result = await axios.get(API_URL);

    //if createRandom is false, create a random player. If createRandom is true, then do not create another random player.
    if(createRandom == false)
    {
        random = Math.floor(Math.random() * result.data.length);
        console.log("Creating random: " + random);
    }
    else
    {
        console.log("already have random: " + random);
    }
     


    //separating player names and ids into separate arrays
    for (var i = 0; i < result.data.length; i++) 
    {
      var fullName = result.data[i].FirstName + " " + result.data[i].LastName;
      Name.push(fullName.toLowerCase());
      ID.push(result.data[i].PlayerID);
    }

    //random player that user is trying to guess
    randomPlayer = result.data[random];

    //JSON data for team info
     teamInfo = await axios.get("https://api.sportsdata.io/v3/nba/scores/json/AllTeams?key=ebf007de2c834bf6b2be8e153fb6a85d");

    //Random player team
    Rteam = JSON.stringify(randomPlayer.Team);
    
    //loop through the team data and assign the random player a team, conference, and logo
    for (var i = 0; i < teamInfo.data.length; i++)
    {
      var T = '"' + teamInfo.data[i].Key + '"';
      if (Rteam === T) 
      {
        RnewTeam = teamInfo.data[i].City + " " + teamInfo.data[i].Name;
        Rconference = teamInfo.data[i].Conference;
        Rlogo = teamInfo.data[i].WikipediaLogoUrl;
      }
    }


    //creating variables for the random player's name, height, and weight
    var name = randomPlayer.FirstName + " " + randomPlayer.LastName;
    var feet = Math.floor(randomPlayer.Height / 12);
    var inches = (((randomPlayer.Height / 12) % 1) * 12).toFixed(0);
    var height = feet + " ' " + inches;
    var weight = randomPlayer.Weight + "lb";


    //if the random player's position is null, then set the position to undetermined
    var P = randomPlayer.DepthChartPosition;
    if(P == null)
    {
        P = "Undetermined";
    }

    //if the random's player's experience is null, then set the experience to 0
    var E = randomPlayer.Experience;
    if(E == null)
    {
        E = 0;
    }

    //creating the array for the random player to send to ejs files
    randomPlayerInfo = [
      randomPlayer.PhotoUrl,
      name,
      RnewTeam,
      Rlogo,
      Rconference,
      height,
      weight,
      E,
      randomPlayer.Jersey,
      P,
      randomPlayer.College,
      feet,
      inches,
      randomPlayer.Weight,
    ];

    console.log("Random Player Shown Below.");
    console.log(randomPlayerInfo);

    //if gameOver is true, then reset the necessary variables to start over
    if(gameOver == true)
    {
         searchInfo = [];
         gameOver = false;
        numberOfguesses = 0;
        numberRemaining = 20;
        randomPlayerInfo = [];
    }
    

    //render index.ejs, and send all data
    res.render("index.ejs", {
      rPlayer: randomPlayerInfo,
      gPlayer: searchInfo,
      numGuesses: numberOfguesses,
      guessesRemaining: numberRemaining,
      Player: correctGuess,
      Team: correctTeam,
      Conference: correctConference,
      Position: correctPosition,
      College: correctCollege,
      Height: correctHeight,
      Weight: correctWeight,
      Experience: correctExperience,
      Jersey: correctJersey,
      GameOver: gameOverMessage,
      List: Name,
    });
  } catch (error) {
    res.render("index.ejs", { content: JSON.stringify(error.status) });
  }
});

app.post("/", async function (req, res) 
{
    //the string that the user typed in
    var g = req.body.Typeguess;


  //if the player is found
  if (Name.includes(g.toLowerCase())) 
  {
    //change the number of guesses and trys each time the user enters a guess
    numberOfguesses++;
    numberRemaining--;

    //if the user runs out of trys, then set game over to true, set the message, and set createRandom to false so the user can play again
    if(numberRemaining == 0 )
    {
        gameOver = true;
        gameOverMessage = "Sorry! You Ran Out of Guesses. The Player was " + randomPlayerInfo[1] + ".";
        console.log("game over");
        createRandom = false;
        randomPlayerInfo = [];
    }

    //telling the server not to create another random player
    createRandom = true;

    //pushing the currently guessed player to an array, so all guesses will show on the screen
    playerGuesses.push(g);
    index.push(Name.indexOf(g));

    //get the info for the guessed player
    const guessResultInfo = await axios.get("https://api.sportsdata.io/v3/nba/scores/json/Player/" + ID[Name.indexOf(g)] + "?key=ebf007de2c834bf6b2be8e153fb6a85d");
    
    //setting the team for the guessed player
    team = JSON.stringify(guessResultInfo.data.Team);

    //loop through the team data and assign the random player a team, conference, and logo
    for (var i = 0; i < teamInfo.data.length; i++) 
    {
      var T = '"' + teamInfo.data[i].Key + '"';
      if (team === T) 
      {
        newTeam = teamInfo.data[i].City + " " + teamInfo.data[i].Name;
        conference = teamInfo.data[i].Conference;
        logo = teamInfo.data[i].WikipediaLogoUrl;
      }
    }

    //creating variables for the random player's name, height, and weight
    var name = guessResultInfo.data.FirstName + " " + guessResultInfo.data.LastName;
    var feet = Math.floor(guessResultInfo.data.Height / 12);
    var inches = (((guessResultInfo.data.Height / 12) % 1) * 12).toFixed(0);
    var height = feet + " ' " + inches;
    var weight = guessResultInfo.data.Weight + "lb";

    console.log(feet + " " + inches);
    
    //if the random's player's position is null, then set the experience to undetermined
    var P = randomPlayer.DepthChartPosition;
    if(P == null)
    {
        P = "Undetermined";
    }

    //if the random's player's experience is null, then set the experience to 0
    var E = guessResultInfo.data.Experience;
    if(E == null)
    {
        E = 0;
    }

    //creating the array for the random player to send to ejs files
    var array = [
      guessResultInfo.data.PhotoUrl,
      name,
      newTeam,
      logo,
      conference,
      height,
      weight,
      E,
      guessResultInfo.data.Jersey,
      P,
      guessResultInfo.data.College,
      feet,
      inches,
      guessResultInfo.data.Weight,
    ];    

    //push current player to an array so all guessed players will show on the screen
    searchInfo.push(array);

    //calling function to check the guessed player against the random player
    checkAnswers(array, randomPlayerInfo);


    console.log(searchInfo);

    //if gameOver is true, then render gameOver.ejs and send data, if not then show index.ejs and allow player to keep playing
    if(gameOver == true)
    {
        res.render("gameOver.ejs", {
        rPlayer: randomPlayerInfo,
        gPlayer: searchInfo,
        numGuesses: numberOfguesses,
        guessesRemaining: numberRemaining,
        Player: correctGuess,
        Team: correctTeam,
        Conference: correctConference,
        Position: correctPosition,
        College: correctCollege,
        Height: correctHeight,
        Weight: correctWeight,
        Experience: correctExperience,
        Jersey: correctJersey,
        GameOver: gameOverMessage,
        List: Name,
        });
    }
    else
    {
        res.redirect("/");
    }
    
  } else {
    //if player is not found show error.ejs and send data
    res.render("error.ejs", {
      rPlayer: randomPlayerInfo,
      gPlayer: searchInfo,
      numGuesses: numberOfguesses,
      guessesRemaining: numberRemaining,
      Player: correctGuess,
      Team: correctTeam,
      Conference: correctConference,
      Position: correctPosition,
      College: correctCollege,
      Height: correctHeight,
      Weight: correctWeight,
      Experience: correctExperience,
      Jersey: correctJersey,
      GameOver: gameOverMessage,
      List: Name,
    });
  }
});

//start server
app.listen(port, function (req, res) {
  console.log("Server listening on port " + port);
});



function checkAnswers(a, r)
{
    //checking to see if user guessed the correct player
    if(a[1] == r[1])
    {
        console.log("Names Match");
        correctGuess.push(true);
        //if the user guessed correctly, then game over
        gameOver = true;
        createRandom = false;

        console.log("game over");
        gameOverMessage = "Congratulations! You Guessed " + r[1] + " Correctly!"; 
    }
    else
    {
        correctGuess.push(false);
    }

    //checking to see if the user guessed the correct team
    if(a[2] === r[2])
    {
        correctTeam.push(true);
        console.log("Teams match");
    }
    else
    {
        correctTeam.push(false);
    }

    //checking to see if the user guessed the correct conference
    if(a[4] == r[4])
    {
        correctConference.push(true);
        console.log("Conferences match");
    }
    else
    {
        correctConference.push(false);
    }


    //checking to see if the user guessed the correct position
    if(a[9] == r[9])
    {
        correctPosition.push(true);
    }
    else
    {
        correctPosition.push(false);
    }


    //checking to see if the user guessed the correct college
    if(a[10] == r[10])
    {
        correctCollege.push(true);
    }
    else
    {
        correctCollege.push(false);
    }

    
    //checking to see how close the user got to the height
    if(a[11] == r[11] && a[12] == r[12])
    {
        correctHeight.push(true);
        console.log("height match");
    }
    else if(a[11] == r[11] && a[12] < r[12])
    {
        correctHeight.push("up");
        console.log("go up in inches");
    }
    else if(a[11] == r[11] && a[12] > r[12])
    {
        correctHeight.push("down");
        console.log("go down in inches");
    }
    else if(a[11] < r[11])
    {
        correctHeight.push("up");
        console.log("go up in feet");
    }
    else if(a[11] > r[11])
    {
        correctHeight.push("down");
        console.log("go down in feet");
    }

    //checking to see how close the user got to the weight
    if(a[13] == r[13])
    {
        correctWeight.push(true);
    }
    else if(a[13] < r[13])
    {
        correctWeight.push("up")
    }
    else if(a[13] > r[13])
    {
        correctWeight.push("down");
    }

    //checking how close the users got to the years of experience
    if(a[7] == r[7])
    {
        correctExperience.push(true);
    }
    else if(a[7] < r[7])
    {
        correctExperience.push("up")
    }
    else if(a[7] > r[7])
    {
        correctExperience.push("down");
    }

    //checking how close the user fot the the jersey number
    if(a[8] == r[8])
    {
        correctJersey.push(true);
    }
    else if(a[8] < r[8])
    {
        correctJersey.push("up")
    }
    else if(a[8] > r[8])
    {
        correctJersey.push("down");
    }




}

