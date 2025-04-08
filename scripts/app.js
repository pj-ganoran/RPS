import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
  get,
  remove,
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

// ✅ Firebase config (replace with your own values)
const firebaseConfig = {
  apiKey: "AIzaSyAT2PsuKWDR0GK-LzmJ9WqW0zYOWbE8-CQ",
  authDomain: "rps-test-ba2ea.firebaseapp.com",
  databaseURL: "https://rps-test-ba2ea-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rps-test-ba2ea",
  storageBucket: "rps-test-ba2ea.firebasestorage.app",
  messagingSenderId: "910355052499",
  appId: "1:910355052499:web:2fb17e2de4377eebe66126"
};

// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let playerId = null;
let opponentId = null;
let currentRoom = null;

const status = document.getElementById("status");
const result = document.getElementById("result");

// 🧠 Host Game — always becomes player1
async function hostGame() {
  const name = document.getElementById("roomName").value.trim();
  if (!name) return alert("Enter a room name");
  currentRoom = name;

  // Clear room (start fresh)
  await remove(ref(db, currentRoom));

  playerId = "player1";
  opponentId = "player2";

  await set(ref(db, `${currentRoom}/${playerId}`), { move: null });

  document.getElementById("lobby").style.display = "none";
  status.innerText = "Room created. Waiting for a player to join...";
  listenForMoves();
}

// 🔗 Join Game — becomes player2 if slot is available
async function joinGame() {
  const name = document.getElementById("roomName").value.trim();
  if (!name) return alert("Enter a room name");
  currentRoom = name;

  const roomRef = ref(db, currentRoom);
  const snapshot = await get(roomRef);
  const data = snapshot.val();

  if (!data || !data.player1) {
    alert("Room doesn't exist or host has not created it yet.");
    return;
  }

  if (data.player2) {
    alert("Room is full.");
    return;
  }

  playerId = "player2";
  opponentId = "player1";

  await set(ref(db, `${currentRoom}/${playerId}`), { move: null });

  document.getElementById("lobby").style.display = "none";
  status.innerText = "Joined room. You are player2. Waiting for host...";
  listenForMoves();
}

// ✊✋✌️ Make a move
function makeMove(move) {
  if (!playerId || !currentRoom) return;
  const playerRef = ref(db, `${currentRoom}/${playerId}`);
  set(playerRef, { move });
  status.innerText = `You chose ${move}. Waiting for opponent...`;
}

// 🧠 Game logic
function decide(p1, p2) {
  if (p1 === p2) return "It's a draw!";
  if (
    (p1 === "rock" && p2 === "scissors") ||
    (p1 === "paper" && p2 === "rock") ||
    (p1 === "scissors" && p2 === "paper")
  ) return "You win!";
  return "You lose!";
}

// 🔁 Listen to both players' moves
function listenForMoves() {
  onValue(ref(db, currentRoom), (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const p1Move = data.player1?.move;
    const p2Move = data.player2?.move;

    if (p1Move && p2Move) {
      const you = data[playerId]?.move;
      const them = data[opponentId]?.move;
      const outcome = decide(you, them);

      result.innerText = `You chose ${you}, opponent chose ${them}. ${outcome}`;
      status.innerText = "Game over. Restarting in 4s...";

      setTimeout(() => {
        resetRoom();
      }, 4000);
    }
  });
}

// ♻️ Reset room after match
function resetRoom() {
  remove(ref(db, currentRoom));
  result.innerText = "";
  status.innerText = `You are ${playerId}. Waiting for the other player...`;
  if (playerId === "player1") {
    hostGame();
  } else {
    status.innerText = "Waiting for host to restart game...";
  }
}

// 🖱 Hook to window
window.hostGame = hostGame;
window.joinGame = joinGame;
window.makeMove = makeMove;
