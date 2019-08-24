# Rock Paper Scissors Royale!

RPS Royale is a game designed to allow two different players to connect to each other remotely  via the web app and play any number of rock paper scissors games until one or both players decide to quit. 

The app was created by Daniel Gold. You can connect with Daniel on [GitHub](https://github.com/LandGod) and [LinkedIn](https://www.linkedin.com/in/danjasongold/), or check out his [Portfolio](https://dangold.me). 

#### Purpose

This app was created in order to learn about and demonstrate my ability to use Firebase and principals of asynchronous server communication. 

#### App Functionality

##### Getting Started 

In order to play the game, simply navigate to [LandGod.github.io/Multiplayer-RPS](https://landgod.github.io/Multiplayer-RPS). You will first be prompted to enter your name. This is simply the name that the other player will see displayed and is not saved between sessions. Once you click submit, one of two things will happen.

If no other players are waiting to play a game, then a new game room will be created and a message will be displayed informing you that you are waiting for another player to join your game.

If, on the other hand, someone else is already waiting for someone to join their game when you click submit, then you will immediately join that game and play will commence. 

##### Playing the Game

Once both players have joined a room, each will be prompted to make a 'throw'. In order to make a 'throw', the user must click a button to select either `rock`, `paper`, or `scissors`. If the user does not make a selection, after a moment, a countdown timer will appear. If, after 15 more seconds, the user has still not made a selection, they automatically lose that round.

After the user has made a 'throw', they will then have to wait until the other user has also made a 'throw'. Once both users have selected their 'throw,' then the results will be displayed on screen and both users will be prompted to quit or play again against the same opponent. The score will also be updated on the top part of the page to reflect the win/loss record of both players across all games this session.

If the user quits, they are returned to the first screen, whereupon they can choose a new name and search for a new opponent.

If the user clicks 'rematch,' then they will have to wait until the other users either clicks rematch as well, triggering a new round, or quits. If the other user quits, then the user waiting for a rematch will be informed and prompted to quit as well.

##### Chat

Once a match between two players has been initiated, the chat sidebar, on the right side of the screen, is activated. This allows users to communicate with eachother. Currently only plain text communication is supported. Please note, that no chat filters currently exist to block explicit content and that all user communications are their own responsibility. 

##### Disconnecting 

If at any time a user quits, experiences a server connection timeout, or closes their browser, the game session is deleted from the server, and the other user, if connected, is informed that their opponent has left and the game is over. Handling disconnects in this manner insures that players are never left hanging, even if their opponent were to exit the app in a non-standard way. Furthermore, because none of the data in each session is meant to be persistent, this ensures that no unnecessary data is stored on the server once it is no longer needed. 