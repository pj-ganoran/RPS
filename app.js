const firebaseConfig = {
  apiKey: "AIzaSyAT2PsuKWDR0GK-LzmJ9WqW0zYOWbE8-CQ",
  authDomain: "rps-test-ba2ea.firebaseapp.com",
  databaseURL: "https://rps-test-ba2ea-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rps-test-ba2ea",
  storageBucket: "rps-test-ba2ea.appspot.com",
  messagingSenderId: "910355052499",
  appId: "1:910355052499:web:2fb17e2de4377eebe66126"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const messagesRef = db.ref('messages');
const usersOnlineRef = db.ref('usersOnline');

// DOM Elements
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const messageList = document.getElementById('messageList');
const clearMessagesBtn = document.getElementById('clearMessagesBtn');
const userCount = document.getElementById('userCount');

// 🔄 Send message
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (text) {
    messagesRef.push({ text });
    messageInput.value = '';
  }
});

// 🔄 Listen for added messages
messagesRef.on('child_added', (snapshot) => {
  const message = snapshot.val();
  const li = document.createElement('li');
  li.setAttribute('data-id', snapshot.key);
  li.textContent = message.text;
  messageList.appendChild(li);
});

// 🔄 Listen for removed messages
messagesRef.on('child_removed', (snapshot) => {
  const li = messageList.querySelector(`[data-id="${snapshot.key}"]`);
  if (li) {
    li.remove();
  }
});

// 🔄 Clear entire list if no data exists
messagesRef.on('value', (snapshot) => {
  if (!snapshot.exists()) {
    messageList.innerHTML = '';
  }
});

// 🔴 Clear all messages button
clearMessagesBtn.addEventListener('click', () => {
  if (confirm("Are you sure you want to delete all messages?")) {
    messagesRef.remove().catch(console.error);
  }
});

// ✅ Live user presence tracking
const userRef = usersOnlineRef.push(true); // Add this client
userRef.onDisconnect().remove();           // Auto-remove on disconnect

// 🟢 Count connected users
usersOnlineRef.on('value', (snapshot) => {
  const count = snapshot.numChildren();
  userCount.textContent = `Users online: ${count}`;
});
