import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
  get,
  remove,
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

// ✅ Firebase Config (replace with your actual values)
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

const room = "rps-room";
let playerId = null;
let opponentId = null;

const status = document.getElementById("status");
const result = document.getElementById("result");

// 🎮 Assign player and auto-write null move
async function assignPlayer() {
  const roomRef = ref(db, room);

  try {
    const snapshot = await get(roomRef);
    const data = snapshot.val();

    console.log("🔥 Current room state:", data);

    if (!data || !data.player1) {
      playerId = "player1";
      opponentId = "player2";
    } else if (!data.player2) {
      playerId = "player2";
      opponentId = "player1";
    } else {
      alert("Room is full. Try again later.");
      status.innerText = "Room is full.";
      return;
    }

    // 📝 Write placeholder move to lock the slot
    await set(ref(db, `${room}/${playerId}`), { move: null });

    status.innerText = `You are ${playerId}. Waiting for the other player...`;
    listenForMoves();
  } catch (err) {
    console.error("❌ Error getting room data:", err);
    status.innerText = "Error loading game.";
  }
}

assignPlayer();

// 🖱 Player makes a move
function makeMove(move) {
  if (!playerId) return;
  const playerRef = ref(db, `${room}/${playerId}`);
  set(playerRef, { move });
  status.innerText = `You chose ${move}. Waiting for opponent...`;
}

// 🔄 Listen for both players' moves
function listenForMoves() {
  onValue(ref(db, room), async (snapshot) => {
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

// 🧠 Decide winner logic
function decide(p1, p2) {
  if (p1 === p2) return "It's a draw!";
  if (
    (p1 === "rock" && p2 === "scissors") ||
    (p1 === "paper" && p2 === "rock") ||
    (p1 === "scissors" && p2 === "paper")
  )
    return "You win!";
  return "You lose!";
}

// 🧹 Reset Firebase data after round
function resetRoom() {
  remove(ref(db, room));
  result.innerText = "";
  status.innerText = `You are ${playerId}. Waiting for the other player...`;
  assignPlayer(); // rejoin
}

// 📌 Attach function to global for buttons
window.makeMove = makeMove;
