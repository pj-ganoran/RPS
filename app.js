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

// 🔄 Real-time listener for added messages
messagesRef.on('child_added', (snapshot) => {
  const message = snapshot.val();
  const li = document.createElement('li');
  li.setAttribute('data-id', snapshot.key);
  li.textContent = message.text;
  messageList.appendChild(li);
});

// 🔄 Real-time listener for removed messages
messagesRef.on('child_removed', (snapshot) => {
  const li = messageList.querySelector(`[data-id="${snapshot.key}"]`);
  if (li) {
    li.remove();
  }
});

// 🔁 Also reset whole list if everything is cleared
messagesRef.on('value', (snapshot) => {
  if (!snapshot.exists()) {
    messageList.innerHTML = '';
  }
});

// 🔴 Clear messages (triggered by button)
clearMessagesBtn.addEventListener('click', () => {
  messagesRef.remove()
      .catch((error) => {
        console.error("Error clearing messages:", error);
      });
});
