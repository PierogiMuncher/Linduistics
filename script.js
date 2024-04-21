const sentences = [
"You are a wizard harry."
];
const symbols = Array.from({length: 26}, (_, i) => `symbols/${i + 1}.svg`);
let currentSentence = '';
let attempts = 0;
let symbolMapping = {};
let tries = 0;

function initializeSymbolMapping() {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    alphabet.forEach((letter, index) => {
        symbolMapping[letter] = symbols[index % symbols.length];
    });
}

document.addEventListener('DOMContentLoaded', function() {
    if (isNewDay()) {
        clearGameData();
    } else {
        initializeGame();
    }
});

function initializeGame() {
    if (localStorage.getItem('gameCompleted') === 'true') {
        let attempts = localStorage.getItem('attempts');
        showCongratulations(attempts);
    } else {
        setupGame();
    }
}

function displaySentence() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    const words = currentSentence.toLowerCase().match(/\b[a-z]+\b/g);

    words.forEach(word => {
        const wordBox = document.createElement('div');
        wordBox.className = 'word-box';
        wordBox.style.border = '1px solid black';
        wordBox.style.margin = '5px';
        wordBox.style.display = 'inline-block';
        wordBox.style.padding = '5px';

        word.split('').forEach(char => {
            const symbolContainer = document.createElement('div');
            symbolContainer.className = 'symbol-container';

            const img = document.createElement('img');
            img.src = symbolMapping[char];
            img.className = 'symbol';

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'guess-input';
            input.maxLength = 1;

            symbolContainer.appendChild(img);
            symbolContainer.appendChild(input);
            wordBox.appendChild(symbolContainer);
        });

        gameBoard.appendChild(wordBox);
    });
}

function checkGuess() {
    tries++;
    let allCorrect = true;
    const inputs = document.querySelectorAll('.guess-input');
    let attempts = parseInt(localStorage.getItem('attempts') || '0');

    inputs.forEach((input, index) => {
        const guessedChar = input.value.trim().toLowerCase();
        const correctChar = currentSentence.toLowerCase().replace(/[^a-z]/gi, '')[index];

        if (guessedChar === correctChar) {
            input.style.backgroundColor = 'pink';
        } else {
            input.style.backgroundColor = '';
            allCorrect = false;
        }
    });

    if (allCorrect) {
        attempts++;
        localStorage.setItem('gameCompleted', 'true');
        localStorage.setItem('attempts', attempts.toString());
        showCongratulations(attempts);
    } else {
        localStorage.setItem('attempts', attempts.toString());
    }
}

function isNewDay() {
    const lastPlayed = localStorage.getItem('lastPlayed');
    const today = new Date().toDateString();

    if (lastPlayed !== today) {
        return true;
    }
    return false;
}

function showCongratulations(attempts) {
    const timeUntilMidnight = getTimeUntilMidnight();
    const message = `Congratulations! You solved the Linguistic in ${tries} tries! Come back in ${timeUntilMidnight}.`;

    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    const messageBox = document.createElement('div');
    messageBox.className = 'message-box';

    // Creating the message text with a line break
    const messageText = document.createElement('span');
    messageText.innerHTML = `Congratulations!<br>You solved the Linduistic in ${tries} attempt(s)!<br>Come back in ${timeUntilMidnight}.<br>`;

    const shareButton = document.createElement('button');
    shareButton.innerText = 'Share';
    shareButton.className = 'share-button';
    shareButton.onclick = function() {
        const shareText = `I just solved the Linduistic in ${attempts} attempt(s)! 💖 Try it yourself: https://pierogimuncher.github.io/Linduistics/`;
        if (navigator.share) {
            navigator.share({
                title: 'My Linduistic Achievement',
                text: shareText
            });
        } else {
            alert('Web Share API not supported.');
        }
    };

    messageBox.appendChild(messageText);
    messageBox.appendChild(shareButton);
    overlay.appendChild(messageBox);
    document.body.appendChild(overlay);
}


function getTimeUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = midnight - now;
    const hours = Math.floor(msUntilMidnight / 1000 / 60 / 60);
    const minutes = Math.floor((msUntilMidnight / 1000 / 60) % 60);
    return `${hours.toString().padStart(2, '0')} hours:${minutes.toString().padStart(2, '0')} minutes`;
}

function clearGameData() {
    localStorage.removeItem('gameCompleted');
    localStorage.removeItem('attempts');
    localStorage.removeItem('lastPlayed');
    setupGame();
}

function setupGame() {
    currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
    initializeSymbolMapping();
    displaySentence();
    localStorage.setItem('lastPlayed', new Date().toDateString());
}

document.getElementById('checkButton').addEventListener('mousedown', function() {
    this.children[0].src = 'ButtonDown.svg';  // Change to the "pressed" image
});

document.getElementById('checkButton').addEventListener('mouseup', function() {
    this.children[0].src = 'ButtonUp.svg';  // Change back to the "unpressed" image
});

document.getElementById('checkButton').addEventListener('mouseleave', function() {
    this.children[0].src = 'ButtonUp.svg';  // Ensure it reverts if cursor leaves while pressed
});


window.onload = setupGame;
