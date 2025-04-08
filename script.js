// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAT2PsuKWDR0GK-LzmJ9WqW0zYOWbE8-CQ",
  authDomain: "rps-test-ba2ea.firebaseapp.com",
  databaseURL: "https://rps-test-ba2ea-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rps-test-ba2ea",
  storageBucket: "rps-test-ba2ea.appspot.com",
  messagingSenderId: "910355052499",
  appId: "1:910355052499:web:2fb17e2de4377eebe66126"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Prompt for player ID
const playerId = prompt("Enter your player ID (player1 or player2)");
const room = "rps-room";

// Listen for both players' moves
db.ref(`${room}/moves`).on("value", (snapshot) => {
  const moves = snapshot.val();
  if (moves && moves.player1 && moves.player2) {
    showResult(moves);
  }
});

// Make a move
function makeMove(choice) {
  db.ref(`${room}/moves/${playerId}`).set(choice);
  document.getElementById("status").textContent = `You chose ${choice}. Waiting for opponent...`;
}

// Show result when both have played
function showResult(moves) {
  const p1 = moves.player1;
  const p2 = moves.player2;

  let result = "";

  if (p1 === p2) {
    result = "It's a tie!";
  } else if (
    (p1 === "rock" && p2 === "scissors") ||
    (p1 === "paper" && p2 === "rock") ||
    (p1 === "scissors" && p2 === "paper")
  ) {
    result = "Player 1 wins!";
  } else {
    result = "Player 2 wins!";
  }

  document.getElementById("status").textContent = `Player 1 chose ${p1}. Player 2 chose ${p2}.`;
  document.getElementById("result").textContent = result;

  // Clear moves after 5 seconds
  setTimeout(() => {
    db.ref(`${room}/moves`).remove();
    document.getElementById("status").textContent = "Waiting for players...";
    document.getElementById("result").textContent = "";
  }, 5000);
}
