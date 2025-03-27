// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child, push } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCA8k3MG9FGgjLa4fkQ979G2hVQf9DNsYs",
  authDomain: "say-it-loud-8e48f.firebaseapp.com",
  databaseURL: "https://say-it-loud-8e48f-default-rtdb.firebaseio.com",
  projectId: "say-it-loud-8e48f",
  storageBucket: "say-it-loud-8e48f.firebasestorage.app",
  messagingSenderId: "677195341918",
  appId: "1:677195341918:web:ea837b45ccfc11f7f454cf",
  measurementId: "G-N6KB82D5GD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to save thought to Firebase
function saveThought(name, thought) {
  const postData = {
    name: name,
    thought: thought,
    hearts: 0,  // Initial hearts count
    timestamp: Date.now() // Timestamp for sorting purposes
  };

  const newPostKey = push(ref(database, 'thoughts')).key;

  // Write the new thought to the database
  set(ref(database, 'thoughts/' + newPostKey), postData);
}

// Handle thought submission
document.getElementById('submit-thought-btn').addEventListener('click', () => {
    const name = document.getElementById('name').value;
    const thought = document.getElementById('thought').value;

    // Blacklist check
    const blacklist = ['badword1', 'badword2', 'badword3']; // Add bad words to this list
    const containsBadWord = blacklist.some(word => name.includes(word) || thought.includes(word));

    if (containsBadWord) {
        alert('No bad words allowed!');
        return;
    }

    if (name && thought) {
        // Save thought to Firebase
        saveThought(name, thought);

        // Hide modal
        document.getElementById('thought-modal').style.display = 'none';

        // Reload the feed
        loadThoughts();
    }
});

// Load thoughts from Firebase and display them
function loadThoughts() {
    const feed = document.getElementById('feed');
    feed.innerHTML = '';  // Clear current feed

    const thoughtsRef = ref(database, 'thoughts'); // Reference to the 'thoughts' node
    get(thoughtsRef).then((snapshot) => {
        if (snapshot.exists()) {
            const thoughts = snapshot.val();
            const sortedThoughts = Object.keys(thoughts).map(key => ({
                id: key,
                ...thoughts[key]
            }));

            // Sort by hearts (most popular first)
            sortedThoughts.sort((a, b) => b.hearts - a.hearts);

            // Render thoughts in the feed
            sortedThoughts.forEach(thought => {
                const thoughtBox = document.createElement('div');
                thoughtBox.classList.add('thought-box');
                thoughtBox.innerHTML = `
                    <h3>${thought.name}</h3>
                    <p>${thought.thought}</p>
                    <span class="heart" data-id="${thought.id}">❤️</span>
                    <span class="hearts-count">${thought.hearts}</span>
                `;
                feed.appendChild(thoughtBox);
            });
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });
}

// Handle heart button click
document.getElementById('feed').addEventListener('click', (e) => {
    if (e.target.classList.contains('heart')) {
        const postId = e.target.getAttribute('data-id');
        const thoughtRef = ref(database, 'thoughts/' + postId);

        // Increment heart count
        get(thoughtRef).then((snapshot) => {
            const thought = snapshot.val();
            if (!thought.heartsGiven) {
                const updatedHearts = thought.hearts + 1;
                set(thoughtRef, {
                    ...thought,
                    hearts: updatedHearts,
                    heartsGiven: true
                });

                // Reload thoughts to reflect the updated hearts count
                loadThoughts();
            }
        });
    }
});

// Show modal when "Share Your Thought" button is clicked
document.getElementById('share-thought-btn').addEventListener('click', () => {
    document.getElementById('thought-modal').style.display = 'block';
});

// Close modal when "Cancel" button is clicked
document.getElementById('cancel-btn').addEventListener('click', () => {
    document.getElementById('thought-modal').style.display = 'none';
});

// Initialize feed when page loads
window.onload = loadThoughts;
