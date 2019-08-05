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
const userNameSpan = $('#user-name-name'); // Upper left-hand corner username display
const userNamePic = $('#user-name-pic'); // Icon that goes to the left of the username
const mainDisplay = $('#main-screen') // Main display area for game action 
const mainReadout = $('#readout'); // Game action descriptions
const feedback = $('#game-feeback'); // Results output

const playDisplayBoxes = $('.play-display-box'); // Boxes for display of rock paper or scissors for each player
const userDisplayBox = $('#user-display');
const opponentDisplayBox = $('#opponent-display');

// RPS Buttons
const allActionButtons = $('.rps-button');
const rockButton = $('#rock-button');
const paperButton = $('#paper-button');
const scissorsButton = $('#scissors-button');

// html element handles for chat:
const chatWindow = $('.chat-window');
const chatHead = $('#chat-header');
const chatBody = $('#chat-body');
const chatInput = $('#chat-input');

// Html elements to add/remove during game
const playButton = $('<button class="btn btn-danger" id="play-button">').text('Play');
const playerInfoForm = $('#playerNameForm');
const playerNameInput = $('#playerName');
const playerInfoSubmit = $('#playerNameSubmit');

// Instantiate some global variables for later
let playerName;
let currentGame;

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

function displayGame() {
    // Reveals all game elements that are hidden before the game is ready to start.
    allActionButtons.removeClass('hide');
    chatWindow.removeClass('hide');
    playDisplayBoxes.removeClass('hide');
};

function setOnUserExit() {
    // Sets an event listener for the user closing this page, so that this can be reported to the other player
    // When triggered, the even listener will delete the current game from the database
    // This event should trigger a response on the other player's machine, but that's dealt with somewhere else 
    // Note that we can't trust this function to always execute, so we will still need to also provide a timeout for responses from the opponent
    // as an additional way to see if they have disconnected, or for that matter, just gone AFK
    $(window).on('unload', () => {
        database.ref().remove(currentGame);
    });
};

function onOpponentDisconnect(reason) {
    // Does what is required to inform the user and otherwise update the DOM when the opponent disconnects.
    // Can do different things depending on whether or not the reaons for disconnect is known
    // Called by listenForDisconnect()
    switch (reason) {
        default:
            console.log('Opponent has disconnected!');
            break;
        case 'time':
            console.log('Opponent lost connection or was kicked for inactivity.');
            break;
        case 'gameOver':
            console.log('Oppenent left.');
            break;

    }
};

function listenForDisconnect() {
    // Sets an event listener for a value change to the current game room in the database
    // For any change other than deleting the whole room, does nothing
    // For a change that deletes the room (sets data value to null) it calls the onOpponentDisconnect function without a reason
    // TODO: Add logic to pass a reason for disconnect to the callback function.
    database.ref(currentGame).on('value', (snapshot) => {
        if (!snapshot.exists()) {
            onOpponentDisconnect();
        }
    });
};

function toggleDisplayBox(box) {
    // Toggles a playerDisplayBox between its default colors as a user or opponent, and the greyed out color sceme. 
    // Will be used when signifying that there is no opponent present yet/ opponent has joined, as well as losses.
    if (box.hasClass('user')) { box.removeClass('user'); box.addClass('nobody') }
    else if (box.hasClass('opponent')) { box.removeClass('opponent'); box.addClass('nobody') }
    else if (box.hasClass('nobody')) {
        box.removeClass('nobody');
        switch (box.attr('id')) {
            case 'user-dispaly':
                box.addClass('user');
                break;
            case 'opponent-display':
                box.addClass('opponent');
                break;
        }
    };
};

//
// Define Click handler for play button which chains into starting the game

playButton.on('click', () => {

    // Remove play button from DOM so user can't activate it more than once
    $('#play-button').detach();

    // Inform user about progress
    feedback.text('Looking for a game...');
    feedback.removeClass('hide');

    // Query database for list of current game rooms
    database.ref().once('value', function (snapshot) {

        // If there are no game rooms currently saved in the database, then make one
        if (!snapshot.exists()) {

            // Inform user about progress
            feedback.text('No games found. Setting up new game...');


            let roomID = database.ref().push({ 'lfg': true, 'player1': playerName, player2: '' }, function () {
                currentGame = roomID.key;
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
                    feedback.text('Game Found! Joining game...');

                    // Construct an update package change looking for game to false and player2 to current user name
                    // Then update server
                    let gameInfoUpdates = {};
                    gameInfoUpdates[`${currentGame}/lfg/`] = false;
                    gameInfoUpdates[`${currentGame}/player2/`] = playerName;
                    database.ref().update(gameInfoUpdates);

                    // Finally, reveal action buttons
                    displayGame();

                    break;
                }
            }
        };

        // If there were other games, but they were all full already, then create a new one, as above.
        if (!currentGame) {

            // Inform user about progress
            feedback.text('No games found. Setting up new game...');

            let roomID = database.ref().push({ 'lfg': true, 'player1': playerName, player2: '' }, function () {
                console.log('created new room: ' + roomID.key)
            });

            // Finally, reveal action buttons, but first signify that no opponent is present with a darkened opponent box and message 
            toggleDisplayBox(opponentDisplayBox);
            feedback.text('Waiting for opponent to connect...');
            displayGame();
        };

    })
});


// When document is fully loaded, enable click handlers
$(document).ready(function () {

    // Grab player name on submit being clicked
    playerInfoSubmit.on('click', (event) => {

        // Don't refresh the page
        event.preventDefault()

        // Get value from name field and run it through some checks
        let pName = playerNameInput.val();

        // Name too short
        if (pName.length < 3) {
            playerNameInput.addClass('is-invalid');
            $('#nameHelp').addClass('is-invalid');
            $('#nameHelp').text('Name too short! Name must be at least 3 letters long.');
            return;
        }
        else {
            // Remove form, set player name and reveal coresponding DOM element, the add play button
            playerName = pName;
            userNameSpan.text(playerName);
            userNameSpan.removeClass('hide');
            userNamePic.removeClass('hide');
            playerInfoForm.remove();
            mainReadout.append(playButton);
        };

    });


});