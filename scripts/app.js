// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
  get,
  remove,
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAT2PsuKWDR0GK-LzmJ9WqW0zYOWbE8-CQ",
  authDomain: "rps-test-ba2ea.firebaseapp.com",
  databaseURL: "https://rps-test-ba2ea-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rps-test-ba2ea",
  storageBucket: "rps-test-ba2ea.appspot.com",
  messagingSenderId: "910355052499",
  appId: "1:910355052499:web:2fb17e2de4377eebe66126"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let playerId = null;
let opponentId = null;
let currentRoom = null;

const status = document.getElementById("status");
const result = document.getElementById("result");
const moveButtons = document.querySelectorAll(".moveButton");
const leaveButton = document.getElementById("leaveButton");
const roomInput = document.getElementById("roomName");
const lobby = document.getElementById("lobby");

leaveButton.addEventListener("click", leaveRoom);

function setMoveButtonsState(enabled) {
  moveButtons.forEach(btn => btn.disabled = !enabled);
}

async function hostGame() {
  const name = roomInput.value.trim();
  if (!name) return alert("Enter a room name");
  currentRoom = name;

  const roomRef = ref(db, currentRoom);
  const snapshot = await get(roomRef);
  if (snapshot.exists()) {
    alert("Room already exists. Please try a different name.");
    return;
  }

  playerId = "player1";
  opponentId = "player2";

  await set(roomRef, {
    player1: { move: null },
    createdAt: Date.now()
  });

  lobby.style.display = "none";
  leaveButton.style.display = "inline-block";
  status.innerText = "Room created. Waiting for a player to join...";
  listenForMoves();
}

async function joinGame() {
  const name = roomInput.value.trim();
  if (!name) return alert("Enter a room name");
  currentRoom = name;

  const roomRef = ref(db, currentRoom);
  const snapshot = await get(roomRef);
  if (!snapshot.exists()) {
    alert("Room does not exist.");
    return;
  }

  const roomData = snapshot.val();
  if (roomData.player2) {
    alert("Room is full.");
    return;
  }

  playerId = "player2";
  opponentId = "player1";

  await set(ref(db, `${currentRoom}/player2`), { move: null });

  lobby.style.display = "none";
  leaveButton.style.display = "inline-block";
  status.innerText = "Joined room. Waiting for moves...";
  listenForMoves();
}

moveButtons.forEach(button => {
  button.addEventListener("click", async () => {
    const move = button.dataset.move;
    if (!currentRoom || !playerId) return;
    await set(ref(db, `${currentRoom}/${playerId}/move`), move);
    setMoveButtonsState(false); // Disable after choosing
  });
});

function listenForMoves() {
  onValue(ref(db, currentRoom), async snapshot => {
    const data = snapshot.val();
    if (!data || !data.player1 || !data.player2) {
      setMoveButtonsState(false);
      return;
    }

    const p1 = data.player1.move;
    const p2 = data.player2.move;
    const bothPlayersPresent = data.player1 && data.player2;

    // Enable if both players are present and current player hasn't made a move
    if (bothPlayersPresent && !data[playerId].move) {
      setMoveButtonsState(true);
    }

    if (p1 && p2) {
      const winner = getWinner(p1, p2);
      result.innerText = winner === "draw" ? "It's a draw!" : `${winner} wins!`;
      setMoveButtonsState(false);
      setTimeout(() => resetMoves(), 5000);
    } else {
      result.innerText = "";
    }
  });
}

function getWinner(p1, p2) {
  if (p1 === p2) return "draw";
  if ((p1 === "rock" && p2 === "scissors") ||
      (p1 === "scissors" && p2 === "paper") ||
      (p1 === "paper" && p2 === "rock")) return "Player 1";
  return "Player 2";
}

async function resetMoves() {
  await set(ref(db, `${currentRoom}/player1/move`), null);
  await set(ref(db, `${currentRoom}/player2/move`), null);
  result.innerText = "";
  status.innerText = "New round. Make your move!";

  // Re-enable buttons after reset if both players still in room
  const snapshot = await get(ref(db, currentRoom));
  const data = snapshot.val();
  if (data && data.player1 && data.player2) {
    setMoveButtonsState(true);
  }
}

async function leaveRoom() {
  if (!currentRoom || !playerId) return;
  await remove(ref(db, `${currentRoom}/${playerId}`));
  location.reload();
}

window.hostGame = hostGame;
window.joinGame = joinGame;
