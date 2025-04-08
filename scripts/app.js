import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, onValue, set, get } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAT2PsuKWDR0GK-LzmJ9WqW0zYOWbE8-CQ",
  authDomain: "rps-test-ba2ea.firebaseapp.com",
  databaseURL: "https://rps-test-ba2ea-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rps-test-ba2ea",
  storageBucket: "rps-test-ba2ea.firebasestorage.app",
  messagingSenderId: "910355052499",
  appId: "1:910355052499:web:2fb17e2de4377eebe66126"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const room = "rps-room";

let playerId = "player1";
const playerRef = ref(db, `${room}/${playerId}`);
const opponentRef = ref(db, `${room}/player2`);

const status = document.getElementById("status");
const result = document.getElementById("result");

function makeMove(move) {
  set(playerRef, { move });
  status.innerText = `You chose ${move}. Waiting for opponent...`;
}

onValue(ref(db, `${room}`), async (snapshot) => {
  const data = snapshot.val();
  if (data?.player1?.move && data?.player2?.move) {
    const p1 = data.player1.move;
    const p2 = data.player2.move;
    const outcome = decide(p1, p2);
    result.innerText = `You chose ${p1}, opponent chose ${p2}. ${outcome}`;
    status.innerText = "Play again!";
    set(ref(db, room), {}); // reset
  }
});

function decide(p1, p2) {
  if (p1 === p2) return "It's a draw!";
  if (
    (p1 === "rock" && p2 === "scissors") ||
    (p1 === "paper" && p2 === "rock") ||
    (p1 === "scissors" && p2 === "paper")
  ) return "You win!";
  return "You lose!";
}
