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

// FirebaseUI config.
var uiConfig = {
    signInSuccessUrl: '<url-to-redirect-to-on-success>',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
    ],
    // tosUrl and privacyPolicyUrl accept either url string or a callback
    // function.
    // Terms of service url/callback.
    tosUrl: 'tos.html',
    // Privacy policy url/callback.
    privacyPolicyUrl: function() {
      window.location.assign('privacy.html');
    }
  };

  // Initialize the FirebaseUI Widget using Firebase.
  var ui = new firebaseui.auth.AuthUI(firebase.auth());
  // The start method will wait until the DOM is loaded.
  ui.start('#firebaseui-auth-container', uiConfig);