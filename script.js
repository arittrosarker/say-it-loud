
document.getElementById('share-thought-btn').addEventListener('click', () => {
    document.getElementById('thought-modal').style.display = 'block';
});

document.getElementById('cancel-btn').addEventListener('click', () => {
    document.getElementById('thought-modal').style.display = 'none';
});

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
        const thoughtData = {
            name: name,
            thought: thought,
            hearts: 0,
            id: Date.now(),
        };

        // Save thought data in the browser (localStorage)
        if (!localStorage.getItem('hasPosted')) {
            let thoughts = JSON.parse(localStorage.getItem('thoughts') || '[]');
            thoughts.push(thoughtData);
            localStorage.setItem('thoughts', JSON.stringify(thoughts));
            localStorage.setItem('hasPosted', true);  // Prevent further posts
        }

        document.getElementById('thought-modal').style.display = 'none';
        loadThoughts();  // Reload the feed
    }
});

// Load Thoughts from localStorage
function loadThoughts() {
    const thoughts = JSON.parse(localStorage.getItem('thoughts') || '[]');
    const feed = document.getElementById('feed');
    feed.innerHTML = '';  // Clear current feed

    // Sort by hearts
    thoughts.sort((a, b) => b.hearts - a.hearts);

    thoughts.forEach(thought => {
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
}

// Handle heart button clicks
document.getElementById('feed').addEventListener('click', (e) => {
    if (e.target.classList.contains('heart')) {
        const postId = e.target.getAttribute('data-id');
        const thoughts = JSON.parse(localStorage.getItem('thoughts'));
        const thought = thoughts.find(t => t.id == postId);

        if (!thought.heartsGiven) {
            thought.hearts++;
            thought.heartsGiven = true; // Prevent multiple hearts
            localStorage.setItem('thoughts', JSON.stringify(thoughts));
            loadThoughts(); // Reload the feed
        }
    }
});

// Initialize the feed
window.onload = loadThoughts;
