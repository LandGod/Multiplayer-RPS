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

const rock = 'rock';
const paper = 'paper';
const scissors = 'scissors';

// Create a handle for firebase data interaction
var database = firebase.database();

function solveGame (u1, u2) {
    // Take two objects and returns the object of the winner, or undefined if there is no winner
    // Inputs must be in the form of {user: username, move: move}
    switch (u1.move) {
        case rock:
            if (u2.move = rock) {return;}
            else if (u2.move = paper) {return u2}
            else if (u2.move = scissors) {return u1};

        case paper:
            if (u2.move = rock) {return u1}
            else if (u2.move = paper) {return}
            else if (u2.move = scissors) {return u2};

        case scissors:
            if (u2.move = rock) {return u2}
            else if (u2.move = paper) {return u1}
            else if (u2.move = scissors) {return};
    
        default:
            throw('Invalid input to solveGame. Moves must either be rock, paper, or scissors');
    }
};