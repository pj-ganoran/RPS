// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAT2PsuKWDR0GK-LzmJ9WqW0zYOWbE8-CQ",
  authDomain: "rps-test-ba2ea.firebaseapp.com",
  databaseURL: "https://rps-test-ba2ea-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rps-test-ba2ea",
  storageBucket: "rps-test-ba2ea.firebasestorage.app",
  messagingSenderId: "910355052499",
  appId: "1:910355052499:web:2fb17e2de4377eebe66126"
};
  
  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  
  const playerId = prompt("Enter your name or player ID");
  const room = "rps-room";
  
  // Listen for other player's move
  db.ref(`${room}/moves`).on('value', (snapshot) => {
    const moves = snapshot.val();
    if (moves && moves.player1 && moves.player2) {
      showResult(moves);
    }
  });
  
  function makeMove(choice) {
    db.ref(`${room}/moves/${playerId}`).set(choice);
  }
  
  function showResult(moves) {
    const p1 = moves.player1;
    const p2 = moves.player2;
  
    if (!p1 || !p2) return;
  
    let result;
    if (p1 === p2) result = "It's a tie!";
    else if ((p1 === "rock" && p2 === "scissors") ||
             (p1 === "paper" && p2 === "rock") ||
             (p1 === "scissors" && p2 === "paper")) {
      result = "Player 1 wins!";
    } else {
      result = "Player 2 wins!";
    }
  
    document.getElementById("result").textContent = result;
  }
  
