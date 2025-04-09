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

// 🟢 Presence tracking
const userRef = usersOnlineRef.push(true);
userRef.onDisconnect().remove();

usersOnlineRef.on('value', (snapshot) => {
  const count = snapshot.numChildren();
  userCount.textContent = `Users online: ${count}`;
});

// 📨 Send new message and prune database
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (text) {
    const newMessageRef = messagesRef.push({ text });

    // ✅ Delete oldest messages if over 10
    messagesRef
      .orderByKey()
      .once('value')
      .then(snapshot => {
        const keys = Object.keys(snapshot.val() || {});
        const excess = keys.length - 10;
        if (excess > 0) {
          const keysToRemove = keys.slice(0, excess); // remove oldest
          keysToRemove.forEach(key => messagesRef.child(key).remove());
        }
      });

    messageInput.value = '';
  }
});

// 🔄 Load and listen to only the latest 10 messages
function loadLast10Messages() {
  messagesRef
    .orderByKey()
    .limitToLast(10)
    .on('value', (snapshot) => {
      messageList.innerHTML = '';
      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val();
        const li = document.createElement('li');
        li.setAttribute('data-id', childSnapshot.key);
        li.textContent = message.text;
        messageList.appendChild(li);
      });
      scrollToBottom(); // 👇 Auto-scroll
    });
}

// 👇 Scroll to bottom of message list
function scrollToBottom() {
  messageList.scrollTop = messageList.scrollHeight;
}

loadLast10Messages();

// 🧹 Clear all messages
clearMessagesBtn.addEventListener('click', () => {
  messagesRef.remove().catch(console.error);
});
