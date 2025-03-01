const DB_NAME = "ExamQuizDB";
const DB_VERSION = 1;
let db;

// Open IndexedDB
const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("scores")) {
        db.createObjectStore("scores", { keyPath: "id", autoIncrement: true });
    }
};

request.onsuccess = function (event) {
    db = event.target.result;
};

// Save score to IndexedDB
function saveScore(username, score) {
    const transaction = db.transaction(["scores"], "readwrite");
    const store = transaction.objectStore("scores");

    store.add({ username, score, date: new Date() });
}

// Fetch top scores from IndexedDB
function loadLeaderboard() {
    const transaction = db.transaction(["scores"], "readonly");
    const store = transaction.objectStore("scores");
    const request = store.getAll();

    request.onsuccess = function () {
        const scores = request.result.sort((a, b) => b.score - a.score);
        const leaderboardList = document.getElementById("leaderboard-list");
        leaderboardList.innerHTML = "";

        scores.forEach((entry, index) => {
            const listItem = document.createElement("li");
            listItem.classList.add("list-group-item");
            listItem.innerHTML = `<strong>#${index + 1} ${entry.username}</strong> - ${entry.score} points`;
            leaderboardList.appendChild(listItem);
        });
    };
}
