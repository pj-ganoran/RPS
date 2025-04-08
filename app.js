// Your Firebase config
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

// DOM Elements
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const messageList = document.getElementById('messageList');
const clearMessagesBtn = document.getElementById('clearMessagesBtn');

// Send message
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (text) {
    messagesRef.push({ text });
    messageInput.value = '';
  }
});

// Listen for new messages
messagesRef.on('child_added', (snapshot) => {
  const message = snapshot.val();
  const li = document.createElement('li');
  li.textContent = message.text;
  messageList.appendChild(li);
});

// 🔴 Clear messages
clearMessagesBtn.addEventListener('click', () => {
  if (confirm("Are you sure you want to delete all messages?")) {
    messagesRef.remove()
      .then(() => {
        messageList.innerHTML = ''; // Clear UI
      })
      .catch((error) => {
        console.error("Error clearing messages:", error);
      });
  }
});
