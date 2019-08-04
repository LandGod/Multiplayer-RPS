// import * as firebaseui from 'firebaseui'

var firebaseConfig = {
    apiKey: "AIzaSyDAyKN-HiFo3_uMhRZERYu8SAZC6ZITARc",
    authDomain: "multiplayer-rps-7330d.firebaseapp.com",
    databaseURL: "https://multiplayer-rps-7330d.firebaseio.com",
    projectId: "multiplayer-rps-7330d",
    storageBucket: "multiplayer-rps-7330d.appspot.com",
    messagingSenderId: "99026760332",
    appId: "1:99026760332:web:559107199d351108"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Create a handle for firebase data interaction
var database = firebase.database();

// For test purposes only! DEBUG DEBUG DEBUG!
localStorage.setItem('currentUserName', 'testUser22');

// make rock paper and scissors variables for easy coding
const rock = 'rock';
const paper = 'paper';
const scissors = 'scissors';

// html element handles:
const userNameDiv = $('#user-name-ul'); // Upper left-hand corner username display
const mainDisplay = $('#main-screen') // Main display area for game action 
const mainReadout = $('#readout'); // Game action descriptions
const feedback = $('#game-feeback'); // Results output

// html element handles for chat:
const chatHead = $('#chat-header');
const chatBody = $('#chat-body');
const chatInput = $('#chat-input');

function solveGame(u1, u2) {
    // Take two objects and returns the object of the winner, or undefined if there is no winner
    // Inputs must be in the form of {user: username, move: move}
    switch (u1.move) {
        case rock:
            if (u2.move = rock) { return; }
            else if (u2.move = paper) { return u2 }
            else if (u2.move = scissors) { return u1 };

        case paper:
            if (u2.move = rock) { return u1 }
            else if (u2.move = paper) { return }
            else if (u2.move = scissors) { return u2 };

        case scissors:
            if (u2.move = rock) { return u2 }
            else if (u2.move = paper) { return u1 }
            else if (u2.move = scissors) { return };

        default:
            throw ('Invalid input to solveGame. Moves must either be rock, paper, or scissors');
    }
};

// When document is fully loaded, enable click handlers
$(document).ready(function () {

    let playerName = localStorage.currentUserName;

    $('#play-button').on('click', () => {

        let currentGame;

        // Remove play button from DOM so user can't activate it more than once
        $('#play-button').detach();

        // Inform user about progress
        $('#game-feeback').text('Looking for a game...');

        // Query database for list of current game rooms
        database.ref().once('value', function (snapshot) {

            // If there are no game rooms currently saved in the database, then make one
            if (!snapshot.exists()) {

                // Inform user about progress
                $('#game-feeback').text('No games found. Setting up new game...');

                let roomID = database.ref().push({ 'lfg': true, 'player1': playerName, player2: '' }, function () {
                    console.log('created new room: ' + roomID.key)
                });
            }

            // If there are rooms saved in the database, check to see if any are waiting for a player 2 (ie: looking for game)
            else {
                games = snapshot.val();
                let roomIDs = Object.getOwnPropertyNames(games)

                // Look at each game in sequence until one is fount where looking for group (lfg) is true
                for (let i = 0; i < roomIDs.length; i++) {
                    if (snapshot.val()[roomIDs[i]].lfg) {

                        // Set room id as the game we'll be referencing from here on in
                        currentGame = roomIDs[i];

                        // Inform user about progress
                        $('#game-feeback').text('Game Found! Joining game...');

                        // Construct an update package change looking for game to false and player2 to current user name
                        // Then update server
                        let gameInfoUpdates = {};
                        gameInfoUpdates[`${currentGame}/lfg/`] = false;
                        gameInfoUpdates[`${currentGame}/player2/`] = playerName;
                        database.ref().update(gameInfoUpdates);

                        break;
                    }
                }
            };

            // If there were other games, but they were all full already, then create a new one, as above.
            if (!currentGame) {

                // Inform user about progress
                $('#game-feeback').text('No games found. Setting up new game...');

                let roomID = database.ref().push({ 'lfg': true, 'player1': playerName, player2: '' }, function () {
                    console.log('created new room: ' + roomID.key)
                });
            };

        })
    });


});