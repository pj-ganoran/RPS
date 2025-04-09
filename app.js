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

// Generate or retrieve unique user ID
let userId = localStorage.getItem('userId');
if (!userId) {
  userId = 'user_' + Math.random().toString(36).substring(2, 10);
  localStorage.setItem('userId', userId);
}

// Assign each user a consistent color
function getUserColor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const saturation = 60 + (Math.abs(hash) % 20); // 60-80%
  const lightness = 50 + (Math.abs(hash) % 10);  // 50-60%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

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
    const newMessageRef = messagesRef.push({ text, userId });

    // ✅ Delete oldest messages if over 10
    messagesRef
      .orderByKey()
      .once('value')
      .then(snapshot => {
        const keys = Object.keys(snapshot.val() || {});
        const excess = keys.length - 10;
        if (excess > 0) {
          const keysToRemove = keys.slice(0, excess);
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

        const color = getUserColor(message.userId || '');
        const fontClass = getUserFontClass(message.userId || '');
        const dot = `<span class="user-dot" style="background-color: ${color};"></span>`;
        li.classList.add(fontClass);
        li.innerHTML = `${dot} ${message.text}`;
        messageList.appendChild(li);
      });
      scrollToBottom();
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

const darkModeToggle = document.getElementById('toggleDarkMode');

function updateDarkModeButton() {
  darkModeToggle.textContent = document.body.classList.contains('dark-mode')
    ? '☀️ Light Mode'
    : '🌙 Dark Mode';
}

// Load saved preference
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
}
updateDarkModeButton();

darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const enabled = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', enabled ? 'enabled' : 'disabled');
  updateDarkModeButton();
});


function getUserFontClass(id) {
  const fontClasses = [
    'font-comic-sans',
    'font-papyrus',
    'font-comic',
    'font-courier',
    'font-space',
    'font-indie',
    'font-shadows',
    'font-patrick',
    'font-fira'
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return fontClasses[Math.abs(hash) % fontClasses.length];
}