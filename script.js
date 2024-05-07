const sentences = [
"Bad bitches is the only thing that I like."
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
            input.dataset.symbol = char;

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
    setupInputListeners();
}

// function setupInputListeners() {
//     const inputs = document.querySelectorAll('.guess-input');
//     inputs.forEach(input => {
//         input.addEventListener('input', function() {
//             const char = input.dataset.symbol;  // Get the character this input represents
//             const value = input.value.trim().toLowerCase();
//             updateAllMatchingInputs(char, value);  // Update all inputs that match the character
//         });
//     });
// }

// function setupInputListeners() {
//     const inputs = document.querySelectorAll('.guess-input');
//     inputs.forEach(input => {
//         input.addEventListener('input', function() {
//             if (input.value) {  // Check if there is a value before proceeding
//                 updateAllMatchingInputs(input.dataset.symbol, input.value.trim().toLowerCase());
//             }
//         });
//     });
// }

function setupInputListeners() {
    const inputs = document.querySelectorAll('.guess-input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            // We can still use this to enforce any non-validation logic if necessary
            // For example, moving focus or updating the value of similarly marked inputs without validating them
            propagateInputValue(input.dataset.symbol, input.value.trim().toLowerCase());
        });
    });
}

function propagateInputValue(char, value) {
    // Update all matching input values without validating them
    const inputs = document.querySelectorAll(`input[data-symbol='${char}']`);
    inputs.forEach(input => {
        input.value = value;
    });
}


function updateAllMatchingInputs(char, value) {
    const inputs = document.querySelectorAll(`input[data-symbol='${char}']`);
    inputs.forEach(input => {
        input.value = value;  // Update the value
        const index = Array.from(input.parentNode.parentNode.children).indexOf(input.parentNode);
        const correctChar = currentSentence.toLowerCase().replace(/[^a-z]/gi, '')[index];
        input.style.backgroundColor = value === correctChar ? 'pink' : '';
        input.disabled = value === correctChar; // Optionally disable input if correct
    });
}

// function updateAllMatchingInputs(char, value) {
//     // Fetch all input elements that have the data-symbol matching 'char'
//     const inputs = document.querySelectorAll(`input[data-symbol='${char}']`);
//     // Retrieve the correct sequence of characters from currentSentence to compare against
//     const filteredSentence = currentSentence.toLowerCase().replace(/[^a-z]/g, '');

//     inputs.forEach(input => {
//         // Update the value of the input
//         input.value = value;
//         // Find the correct character based on the absolute index of this input in the context of all inputs
//         const allInputs = document.querySelectorAll('.guess-input');
//         const index = Array.from(allInputs).indexOf(input);
//         const correctChar = filteredSentence[index];  // Get the correct character based on index

//         // Set background color based on correctness
//         input.style.backgroundColor = (value === correctChar) ? 'pink' : 'white';
//         // Optionally disable the input if the value is correct
//         input.disabled = (value === correctChar);
//     });
// }



// function checkGuess() {
//     let tries = parseInt(localStorage.getItem('tries') || '0');
//     tries++;
//     updateCountdown();
//     let allCorrect = true;
//     const inputs = document.querySelectorAll('.guess-input');
//     let attempts = parseInt(localStorage.getItem('attempts') || '0');

//     inputs.forEach((input, index) => {
//         const guessedChar = input.value.trim().toLowerCase();
//         const correctChar = currentSentence.toLowerCase().replace(/[^a-z]/gi, '')[index];

//         if (guessedChar === correctChar) {
//             input.style.backgroundColor = 'pink';
//             input.disabled = true; // Lock the input box if correct
//         } else {
//             input.style.backgroundColor = '';
//             allCorrect = false;
//         }
//     });

//     localStorage.setItem('tries', tries.toString());

//     if (allCorrect) {
//         localStorage.setItem('gameCompleted', 'true');
//         showCongratulations(tries);
//     } else if (tries >= 5) {
//         showFailureMessage();
//     }
//     // Trigger the jiggle animation on all symbols
//     const symbols = document.querySelectorAll('.symbol');
//     symbols.forEach(symbol => {
//         symbol.classList.add('symbol-jiggle');
//     });

//     // Remove the jiggle class after half a second to allow retriggering
//     setTimeout(() => {
//         symbols.forEach(symbol => {
//             symbol.classList.remove('symbol-jiggle');
//         });
//     }, 500); // Matches the animation duration
// }

document.getElementById('checkButton').addEventListener('click', function() {
    checkGuess();
});

function checkGuess() {
    const inputs = document.querySelectorAll('.guess-input');
    let allCorrect = true;
    const filteredSentence = currentSentence.toLowerCase().replace(/[^a-z]/g, '');
    
    inputs.forEach((input, index) => {
        const guessedChar = input.value.trim().toLowerCase();
        const correctChar = filteredSentence[index];

        if (guessedChar === correctChar) {
            input.style.backgroundColor = 'pink';
            input.disabled = true; // Optionally lock the input box if correct
        } else {
            input.style.backgroundColor = 'white';
            allCorrect = false;
        }
    });

    updateGameStatus(allCorrect);
}

function updateGameStatus(allCorrect) {
    if (allCorrect) {
        showCongratulations();
    } else {
        incrementAttempts();
    }
}

function incrementAttempts() {
    attempts++;
    localStorage.setItem('tries', attempts.toString());
    if (attempts >= maxAttempts) {
        showFailureMessage();
        lockGame();
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
        localStorage.setItem('gameLocked', 'false');
        localStorage.setItem('lastPlayed', today);
        localStorage.setItem('tries', '0');
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
    localStorage.clear();
    setupGame();
}

function setupGame() {

    const lines = JSON.parse(localStorage.getItem('sentences') || '[]');
    let index = parseInt(localStorage.getItem('sentenceIndex') || '0');
    // if (index >= lines.length - 1) index = 0; // Reset if index exceeds number of lines

    // Check if index is within the range of lines array
    if (index >= lines.length) {
        console.error("Index is out of bounds:", index);
        index = 0;  // Reset index or handle error appropriately
        localStorage.setItem('sentenceIndex', index.toString());
    }

    // Safely access the sentence and hint
    const sentence = lines[index] ? lines[index].trim() : "Default sentence";
    const hint = lines[index + 1] ? lines[index + 1].trim() : "Default hint";

    // currentSentence = lines[index].trim();

    // currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
    initializeSymbolMapping();
    displaySentence();

    document.querySelector('h4').textContent = "Today's hint: " + hint;
    currentSentence = sentence;
    localStorage.setItem('tries', '0');
    localStorage.setItem('lastPlayed', new Date().toDateString());
}

// document.getElementById('checkButton').addEventListener('mousedown', function() {
//     this.children[0].src = 'ButtonDown.svg';  // Change to the "pressed" image
//     // Play the button press sound
//     document.getElementById('buttonPressAudio').play();
// });

// document.getElementById('checkButton').addEventListener('mouseup', function() {
//     this.children[0].src = 'ButtonUp.svg';  // Change back to the "unpressed" image
// });

// document.getElementById('checkButton').addEventListener('mouseleave', function() {
//     this.children[0].src = 'ButtonUp.svg';  // Ensure it reverts if cursor leaves while pressed
// });

// const checkButton = document.getElementById('checkButton');
// const buttonImage = checkButton.children[0]; // assuming the image is the first child

let lastExecutionTime = 0;
const debounceInterval = 300; // 300 ms debounce interval

document.getElementById('checkButton').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default action to stop triggering click after touch
    const currentTime = new Date().getTime();
    if (currentTime - lastExecutionTime >= debounceInterval) {
        lastExecutionTime = currentTime;
        this.children[0].src = 'ButtonDown.svg';
        setTimeout(() => { 
            this.children[0].src = 'ButtonUp.svg'; 
        }, 150);
    }
});



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


document.addEventListener('DOMContentLoaded', function() {
    if (isNewDay() || !localStorage.getItem('sentences')) {
        fetchSentences(); // Fetch and setup game if it's a new day or no data is available
        // incrementSentenceIndex();
    } else {
        updateGameFromStoredSentences(); // Continue with stored sentences
    }
});

function incrementSentenceIndex() {
    const lines = JSON.parse(localStorage.getItem('sentences') || '[]');
    let index = parseInt(localStorage.getItem('sentenceIndex') || '0');
    index = (index + 2) % lines.length; // Increment index to next pair and wrap around if needed
    localStorage.setItem('sentenceIndex', index.toString());
}

function fetchSentences() {
    fetch('https://raw.githubusercontent.com/PierogiMuncher/Linduistics/main/sentences.txt')
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n').filter(line => line.trim() !== ''); // Filter out empty lines
            localStorage.setItem('sentences', JSON.stringify(lines));
            if (isNewDay()) {  // Ensure it's a new day before incrementing
                incrementSentenceIndex();
            }
            if (!localStorage.getItem('sentenceIndex')) {
                localStorage.setItem('sentenceIndex', '0');
            }
            // incrementSentenceIndex(); // Increment index after new data is fetched
            updateGameFromStoredSentences();
        })
        .catch(error => {
            console.error('Failed to fetch sentences:', error);
        });
}

function updateGameFromStoredSentences() {
    const lines = JSON.parse(localStorage.getItem('sentences') || '[]');
    let index = parseInt(localStorage.getItem('sentenceIndex') || '0');
    // if (index >= lines.length - 1) index = 0; // Reset if index exceeds number of lines
    if (index >= lines.length) {
        index = 0;
        localStorage.setItem('sentenceIndex', index.toString());
    }

    currentSentence = lines[index].trim();
    // const sentence = lines[index].trim();
    const hint = lines[index + 1].trim();
    
    document.querySelector('h4').textContent = "Today's hint: " + hint;
    initializeSymbolMapping();
    // displaySentence(sentence);
    displaySentence();
    
    // localStorage.setItem('sentenceIndex', (index + 2).toString()); // Move to the next pair
    // localStorage.setItem('lastPlayed', new Date().toDateString());
}


window.onload = setupGame;
