const sentences = [
"Sadie from the TV show awkward."
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
    if (localStorage.getItem('gameCompleted') === 'true' || localStorage.getItem('gameLocked') === 'true') {
        let attempts = localStorage.getItem('tries');
        if (localStorage.getItem('gameCompleted') === 'true') {
            showCongratulations(attempts);
        } else {
            showFailureMessage();
        }
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

        const inputs = []; // Store references to input elements

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
            inputs.push(input);
        });

        gameBoard.appendChild(wordBox);

        // Set up the input focus movement
        inputs.forEach((input, index) => {
            input.addEventListener('input', () => {
                if (input.value && index < inputs.length - 1) {
                    inputs[index + 1].focus(); // Move focus to next input
                }
            });
        });
    });
}

function checkGuess() {
    let tries = parseInt(localStorage.getItem('tries') || '0');
    tries++;
    let allCorrect = true;
    const inputs = document.querySelectorAll('.guess-input');
    let attempts = parseInt(localStorage.getItem('attempts') || '0');

    inputs.forEach((input, index) => {
        const guessedChar = input.value.trim().toLowerCase();
        const correctChar = currentSentence.toLowerCase().replace(/[^a-z]/gi, '')[index];

        if (guessedChar === correctChar) {
            input.style.backgroundColor = 'pink';
            input.disabled = true; // Lock the input box if correct
        } else {
            input.style.backgroundColor = '';
            allCorrect = false;
        }
    });

    localStorage.setItem('tries', tries.toString());

    if (allCorrect) {
        localStorage.setItem('gameCompleted', 'true');
        showCongratulations(tries);
    } else if (tries >= 5) {
        showFailureMessage();
    }
}

function showFailureMessage() {
    const message = `You did not solve the Linduistic today! Answer was: ${currentSentence}`;

    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    const messageBox = document.createElement('div');
    messageBox.className = 'message-box';
    messageBox.innerHTML = `<span>${message}<br>Come back tomorrow!</span>`;

    overlay.appendChild(messageBox);
    document.body.appendChild(overlay);

    localStorage.setItem('gameLocked', 'true');
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
    const message = `Congratulations! You solved the Linduistic in ${attempts} tries! Come back in ${timeUntilMidnight}.`;

    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    const messageBox = document.createElement('div');
    messageBox.className = 'message-box';

    // Creating the message text with a line break
    const messageText = document.createElement('span');
    messageText.innerHTML = `Congratulations!<br>You solved the Linduistic in ${attempts} attempt(s)!<br>Come back in ${timeUntilMidnight}.<br>`;

    const shareButton = document.createElement('button');
    shareButton.innerText = 'Share';
    shareButton.className = 'share-button';
    shareButton.onclick = function() {
        const shareText = `I just solved the Linduistic in ${attempts} attempt(s)! 💖 Try it yourself: www.linduistics.com`;
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
    // Play the button press sound
    document.getElementById('buttonPressAudio').play();
});

document.getElementById('checkButton').addEventListener('mouseup', function() {
    this.children[0].src = 'ButtonUp.svg';  // Change back to the "unpressed" image
});

document.getElementById('checkButton').addEventListener('mouseleave', function() {
    this.children[0].src = 'ButtonUp.svg';  // Ensure it reverts if cursor leaves while pressed
});

const checkButton = document.getElementById('checkButton');
const buttonImage = checkButton.children[0]; // assuming the image is the first child

// // Function to change to the "pressed" image
// function pressButton() {
//     buttonImage.src = 'ButtonDown.svg';
//     document.getElementById('buttonPressAudio').play();  // Play the button press sound
// }

// // Function to revert to the "unpressed" image
// function releaseButton() {
//     buttonImage.src = 'ButtonUp.svg';
//     checkGuess();
// }

// // Add mouse event listeners
// checkButton.addEventListener('mousedown', pressButton);
// checkButton.addEventListener('mouseup', releaseButton);
// checkButton.addEventListener('mouseleave', releaseButton);

// // Add touch event listeners for mobile devices
// checkButton.addEventListener('touchstart', function(event) {
//     event.preventDefault(); // Prevents the mouse event from also being fired
//     pressButton();
// });

// checkButton.addEventListener('touchend', function(event) {
//     event.preventDefault(); // Prevents the mouse event from also being fired
//     releaseButton();
// });

// checkButton.addEventListener('touchcancel', function(event) {
//     event.preventDefault(); // Prevents the mouse event from also being fired
//     releaseButton();
// });


let countdown = 5; // Start the countdown at 5

function updateCountdown() {
    if (countdown > 0) {
        countdown--; // Decrement the countdown
        document.getElementById('countDown').textContent = countdown; // Update the display
    }
}


window.onload = setupGame;
