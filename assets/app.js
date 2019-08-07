// import * as firebaseui from 'firebaseui'

$(document).ready(function () {

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
    const opponentNameSpan = $('#opponent-name-name'); // Upper left-hand corner opponentname display
    const opponentNamePic = $('#opponent-name-pic'); // Icon that goes to the left of the opponentname
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
    let playerTwo;
    let afkTime = 15; // Used for AFK Timer
    let amPlayer; // Use this to keep track of whether or not you are host: player1, or joiner: player 2. On the server side.

    // Take two 'throws' and returns the object of the winner, or undefined if there is no winner
    function solveGame(u1, u2) {

        switch (u1) {
            case 'rock':
                if (u2 === 'rock') { return 'draw' }
                else if (u2 === 'paper') { return 'loss' }
                else if (u2 === 'scissors') { return 'win' };
                break;

            case 'paper':
                if (u2 === 'rock') { return 'win' }
                else if (u2 === 'paper') { return 'draw' }
                else if (u2 === 'scissors') { return 'loss' };
                break;

            case 'scissors':
                if (u2 === 'rock') { return 'loss' }
                else if (u2 === 'paper') { return 'win' }
                else if (u2 === 'scissors') { return 'draw' };
                break;

            default:
                throw ('Invalid input to solveGame. Moves must either be rock, paper, or scissors');
        }
    };

    // Reveals all game elements that are hidden before the game is ready to start.
    function displayGame() {

        allActionButtons.removeClass('hide');
        chatWindow.removeClass('hide');
        playDisplayBoxes.removeClass('hide');

    };

    // Makes the chat sidebar useable
    function startChat() {

        // Reveal opponent name
        opponentNameSpan.text(playerTwo);
        opponentNamePic.css('background-color', 'pink');

        // Only create a new chat folder in the game room folder if you are the host
        if (amPlayer === 'player1') {
            database.ref(`${currentGame}/chat/`).set('null');
        };

        // Setup and event listener for children added to the newly created chat folder
        database.ref(`${currentGame}/chat/`).on('child_added', function (snapshot) {
            if (snapshot) {
                console.log(`Recieving new chat: ${snapshot.val()}`);
                console.log(snapshot)
                console.log(snapshot.val())
                console.log(snapshot.val().message)
                let sender = snapshot.val().name
                let message = snapshot.val().message

                let newChatLine = $('<p>').text(message);
                let strongName = $('<strong>').text(sender + ': ');
                newChatLine.prepend(strongName)
                chatBody.append(newChatLine);
            };
        });

        // Setup an event handler for the chat input
        chatInput.keyup(function (event) {
            if (event.which == 13) {
                console.log(`Sending chat: ${$(this).val()}`);
                console.log(playerName)
                database.ref(`${currentGame}/chat/`).push({name: playerName, message: $(this).val()});
                $(this).val('');
            }
            else {
                console.log("Didn't press enter! Keypress was:");
                console.log(event.which);
            }
        });

    };

    // Sets an event listener for the user closing this page, so that this can be reported to the other player
    // When triggered, the even listener will delete the current game from the database
    // This event should trigger a response on the other player's machine, but that's dealt with somewhere else 
    // Note that we can't trust this function to always execute, so we will still need to also provide a timeout for responses from the opponent
    // as an additional way to see if they have disconnected, or for that matter, just gone AFK
    function setOnUserExit() {

        $(window).on('unload', () => {
            database.ref().remove(currentGame);
        });
    };

    // Does what is required to inform the user and otherwise update the DOM when the opponent disconnects.
    // Can do different things depending on whether or not the reaons for disconnect is known
    // Called by listenForDisconnect()
    function onOpponentDisconnect(reason) {

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

    // Sets an event listener for a value change to the current game room in the database
    // For any change other than deleting the whole room, does nothing
    // For a change that deletes the room (sets data value to null) it calls the onOpponentDisconnect function without a reason
    // TODO: Add logic to pass a reason for disconnect to the callback function.
    function listenForDisconnect() {

        database.ref(currentGame).on('value', (snapshot) => {
            if (!snapshot.exists()) {
                onOpponentDisconnect();
            }
        });
    };

    // Toggles a playerDisplayBox between its default colors as a user or opponent, and the greyed out color sceme. 
    // Will be used when signifying that there is no opponent present yet/ opponent has joined, as well as losses.
    function toggleDisplayBox(box) {

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

    // Sets up an event listener for the opponent connecting to the game
    // Then starts the game, after a pause, when the opponent joins
    function listenForConnect(callback) {

        database.ref(`${currentGame}/player2/`).on('value', (snapshot) => {

            if (!snapshot.val()) {
                // If no value for player2 then do nothing
                console.log("No current value for player 2");
            }
            else {
                // Remove this listener since we only needed it until it returned this data
                database.ref(`${currentGame}/player2/`).off();

                // Set playerTwo variable and inform the user that player 2 has connected
                playerTwo = snapshot.val();
                feedback.text(playerTwo + ' has joined the game!');
                toggleDisplayBox(opponentDisplayBox);

                // Then runs the callback which should probably be moving the actual play phase of the game
                callback()
            };
        });
    };

    // Ends the game and informs the user that they have won or lost or had a draw.
    function endGame(reason) {

        console.log('endGame was called!')

        switch (reason) {
            case 'timeout':
                feedback.text(`You have forfieted the game`)
                break;
            case 'loss':
                feedback.text(`${playerTwo} wins!`)
                break;
            case 'win':
                feedback.text(`You win!`)
                break;
            case 'draw':
                feedback.text(`It's a draw!`)
                break;
            case 'disconnect':
                feedback.text(`${playerTwo} disconnected`)
                break;
            default:
                throw ('Error: Invalid reason given for game end.')
        }
    }

    // Called by timer in commencePlay if user does not take action quickly enough. 
    // Ends the game is the timer reaches zero
    function countDown() {

        // What to do when timer reaches zero
        if (afkTime <= 0) {
            clearInterval(afkTimer);
            endGame('timeout');
        }
        // Else, decrement timer
        feedback.text(`You have ${afkTime} seconds to throw or you will be disqualified!`);
        afkTime--;
    };

    // Activates play action buttons, afk timers, and win/loss conditions
    function commencePlay() {

        // Enable Chat
        console.log('Enabling chat...')
        startChat();

        // Wait 1 second just so the user sees that the opponent joined before doing anything else
        setTimeout(function () {
            console.log('Commencing play');

            // Print play message and start a timeout clock
            feedback.text('Throw!');

            // Give the user 3 seconds, then start a clock for afk disconect 
            afkTimeOut = setTimeout(function () {
                afkTimer = setInterval(countDown, 1000);
                feedback.css('color', 'red');
            }, 3000);

            // The enable action buttons
            allActionButtons.removeAttr('disabled')

            allActionButtons.on('click', function () {
                // Evenet listener for user making a selection of rock, paper, or scissors. Can only trigger one time.

                // First thing we need to imediately remove this event listener so that the user can't make more than one selection
                allActionButtons.off();

                // We need to clear our timers, but since only one of them will be active at time, and becaue we don't know which it will be,
                // we should reference both and just catch the resulting Reference Error
                try {
                    clearTimeout(afkTimeOut);
                    clearInterval(afkTimer);
                }
                catch (error) {
                    // We expect a reference error here, but if we get any other kind of error we'll pass it along
                    if (!(error instanceof ReferenceError)) {
                        console.log(error)
                        console.log(`Couldn't catch ${typeof (error)} because it was not a Reference Error`)
                        throw (error)
                    };
                }

                // We should also clear the feedback div since it may be another while before we know if we won or not
                feedback.text('');

                // Then we can grab the user's choice and update the DOM with that information.
                let uAction = $(this).val();

                // Reflect selection via button and disable buttons
                allActionButtons.attr('disabled', '')
                $(`#${uAction}-button`).removeClass('btn-dark');
                $(`#${uAction}-button`).addClass('btn-success');

                // Display user choice in their display box
                userDisplayBox.css('background-image', `url("assets/${uAction}.png"`)

                // We should also send our choice to the database
                // Because both players have already stored eachother's names localy, we can reuse those fields on the database to add our actions
                database.ref('/' + currentGame + '/' + amPlayer + '/').set(uAction);

                // I know this is confusing, but again, server side, host is always player1 and we need to know server p1 and p2 to grab the proper data
                let otherPlayer;
                if (amPlayer == 'player1') { otherPlayer = 'player2' } else { otherPlayer = 'player1' };

                // Then, to get the opponent's play, we'll need an event listener for the database.
                database.ref('/' + currentGame + '/' + otherPlayer + '/').on('value', function (snapshot) {

                    // We only want to grab this data if it has been changed from the username
                    if (snapshot.val() !== playerTwo) {
                        console.log('You threw:');
                        console.log(uAction);
                        console.log('Other user threw:');
                        console.log(snapshot.val());
                        opponentDisplayBox.css('background-image', `url("assets/${snapshot.val()}.png"`)
                        let result = solveGame(uAction, snapshot.val());
                        endGame(result);
                    };
                });

            });

        }, 1000)
    }

    // Define Click handler for play button which chains into starting the game
    // The play button leads to one of 3 possibilities:
    // 1. No game rooms exist, so we'll create one 
    // 2. A game room exists and is looking for game so we'll join it
    // 3. A game room exists but none of them are 'looking for game' so we'll create a new one
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

                // Create new game room and save room ID to current game variable
                let roomID = database.ref().push({ 'lfg': true, 'player1': playerName, player2: '' }, function () {
                    currentGame = roomID.key;
                    console.log('created new room: ' + currentGame)
                });

                // Locally we're always player1, but on the database, we're also player1 if we created the room
                amPlayer = 'player1'

                // Start listening for a connection from an opponent
                listenForConnect(commencePlay);

                return;

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

                        // Get other player's name
                        playerTwo = snapshot.val()[currentGame].player1;

                        // Locally we're always player1, but on the database, we're player2 since we joined another's game.
                        amPlayer = 'player2'

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
                        commencePlay();

                        return;
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

                // Set new room's ID as currentGame
                currentGame = roomID.key

                // Locally we're always player1, but on the database, we're also player1 if we created the room
                amPlayer = 'player1'

                // Finally, reveal action buttons, but first signify that no opponent is present with a darkened opponent box and message 
                toggleDisplayBox(opponentDisplayBox);
                feedback.text('Waiting for opponent to connect...');
                displayGame();

                // Start listening for a connection from an opponent
                listenForConnect(commencePlay);
            };

        })
    });

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

            opponentNameSpan.removeClass('hide');
            opponentNamePic.removeClass('hide');

            playerInfoForm.remove();
            mainReadout.append(playButton);
        };

    });


});