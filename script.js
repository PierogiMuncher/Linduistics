const sentences = [
    "Bad bitches is the only thing that I like."
];
const symbols = Array.from({ length: 26 }, (_, i) => `symbols/${i + 1}.svg`);
let currentSentence = '';
let attempts = 0;
let symbolMapping = {};
const maxAttempts = 5;

function initializeSymbolMapping() {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    alphabet.forEach((letter, index) => {
        symbolMapping[letter] = symbols[index % symbols.length];
    });
}

function displaySentence() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    const words = currentSentence.toLowerCase().match(/\b[a-z]+\b/g);
    words.forEach(word => {
        const wordBox = document.createElement('div');
        wordBox.className = 'word-box';
        gameBoard.appendChild(wordBox);
        word.split('').forEach(char => {
            const symbolContainer = document.createElement('div');
            symbolContainer.className = 'symbol-container';
            wordBox.appendChild(symbolContainer);
            const img = document.createElement('img');
            img.src = symbolMapping[char];
            img.className = 'symbol';
            symbolContainer.appendChild(img);
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'guess-input';
            input.maxLength = 1;
            input.dataset.symbol = char;
            symbolContainer.appendChild(input);
        });
    });
    setupInputListeners();
}

function setupInputListeners() {
    document.querySelectorAll('.guess-input').forEach(input => {
        input.addEventListener('input', function() {
            propagateInputValue(input.dataset.symbol, input.value.trim().toLowerCase());
        });
    });
}

function propagateInputValue(char, value) {
    document.querySelectorAll(`input[data-symbol='${char}']`).forEach(input => {
        input.value = value;
    });
}

function checkGuess() {
    const inputs = document.querySelectorAll('.guess-input');
    let allCorrect = true;
    const filteredSentence = currentSentence.toLowerCase().replace(/[^a-z]/g, '');
    inputs.forEach((input, index) => {
        const guessedChar = input.value.trim().toLowerCase();
        const correctChar = filteredSentence[index];
        if (guessedChar === correctChar) {
            input.style.backgroundColor = 'pink';
            input.disabled = true;
        } else {
            input.style.backgroundColor = 'white';
            allCorrect = false;
        }
    });
    attempts++;
    if (allCorrect) {
        showCongratulations();
        lockGame();
    } else if (attempts >= maxAttempts) {
        showFailureMessage();
        lockGame();
    }
}

function lockGame() {
    localStorage.setItem('gameLocked', 'true');
    disableInputs();
}

function disableInputs() {
    document.querySelectorAll('.guess-input').forEach(input => input.disabled = true);
}

function showFailureMessage() {
    showMessage("You did not solve the Linduistic today! Answer was: " + currentSentence);
}

function showCongratulations() {
    showMessage("Congratulations! You solved the Linduistic in " + attempts + " attempts!");
}

function showMessage(message) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    const messageBox = document.createElement('div');
    messageBox.className = 'message-box';
    messageBox.textContent = message;
    overlay.appendChild(messageBox);
    document.body.appendChild(overlay);
}

function isNewDay() {
    const lastPlayed = localStorage.getItem('lastPlayed');
    const today = new Date().toDateString();
    if (lastPlayed !== today) {
        localStorage.setItem('gameLocked', 'false');
        localStorage.setItem('lastPlayed', today);
        localStorage.setItem('tries', '0');
        return true;
    }
    return false;
}

function setupGame() {
    if (localStorage.getItem('gameLocked') === 'true') {
        showLockState();
        return;
    }
    if (isNewDay() || !localStorage.getItem('sentences')) {
        fetchSentences();
    } else {
        updateGameFromStoredSentences();
    }
}

function fetchSentences() {
    fetch('https://raw.githubusercontent.com/PierogiMuncher/Linduistics/main/sentences.txt')
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n').filter(line => line.trim() !== '');
            localStorage.setItem('sentences', JSON.stringify(lines));
            incrementSentenceIndex();
            updateGameFromStoredSentences();
        })
        .catch(error => {
            console.error('Failed to fetch sentences:', error);
        });
}

function updateGameFromStoredSentences() {
    const lines = JSON.parse(localStorage.getItem('sentences'));
    let index = parseInt(localStorage.getItem('sentenceIndex') || '0');
    if (index >= lines.length) {
        index = 0;
    }
    currentSentence = lines[index];
    document.querySelector('h4').textContent = "Today's hint: " + (lines[index + 1] ? lines[index + 1].trim() : "No hint available");
    initializeSymbolMapping();
    displaySentence();
}

function incrementSentenceIndex() {
    let index = parseInt(localStorage.getItem('sentenceIndex') || '0');
    index = (index + 2) % JSON.parse(localStorage.getItem('sentences')).length;
    localStorage.setItem('sentenceIndex', index.toString());
}

function clearGameData() {
    localStorage.clear();
    attempts = 0;
    setupGame();
}

document.addEventListener('DOMContentLoaded', setupGame);
document.getElementById('checkButton').addEventListener('click', checkGuess);

