const buttonColors = ["yellow", "green", "blue", "red"];
let gamePattern = [];
let userClickedPattern = [];
let level = 0;
let timeLimit = 10000; // 10 seconds in milliseconds
let timer; // To track the timer state
let isGameStarted = false; // Track if the game has started
let isVolumeOn = true;
let isSequencePlaying = false; // Track if the sequence is currently playing

window.addEventListener("load", function() {
    const helpButton = document.getElementById("help");
    const startButton = document.getElementById("start-button");
    const helpDiv = document.getElementById("help-div");
    
    // Toggle the help div when the help button is clicked
    helpButton.addEventListener("click", function (event) {
        event.stopPropagation(); // Prevent the click event from bubbling up to the document
        
        // Toggle visibility of the help div
        helpDiv.style.display = helpDiv.style.display === "block" ? "none" : "block";
        
        // Position the help div just below the buttons
        const helpButtonRect = helpButton.getBoundingClientRect();
        const startButtonRect = startButton.getBoundingClientRect();
        
        // Position help div below the buttons
        helpDiv.style.top = `${helpButtonRect.bottom + 10}px`;  // 10px gap between the button and the help div
        helpDiv.style.left = `${Math.min(helpButtonRect.left, startButtonRect.left)}px`;
    });
    
    // Hide the help div if the start button is clicked
    startButton.addEventListener("click", function () {
        helpDiv.style.display = "none";
    });

    // Hide the help div if the user clicks anywhere outside of the help div
    document.addEventListener("click", function (event) {
        if (!helpDiv.contains(event.target) && !helpButton.contains(event.target)) {
            helpDiv.style.display = "none";
        }
    });

    // Prevent clicks inside the help div from closing it
    helpDiv.addEventListener("click", function (event) {
        event.stopPropagation();
    });

    // Get the volume icon element
    const volumeIcon = document.querySelector(".icons[alt='Volume']");

    // Define the paths to your volume on and off icons
    const volumeOnIcon = "Icons/Volume_On_Light.png";
    const volumeOffIcon = "Icons/Volume_Off_Light.png";

    // Add click event listener to the volume icon
    volumeIcon.addEventListener("click", function() {
        // Toggle the volume state
        isVolumeOn = !isVolumeOn;

        // Change the image source based on the current state
        if (isVolumeOn) {
                volumeIcon.src = volumeOnIcon; // Volume on image
        } else {
                volumeIcon.src = volumeOffIcon; // Volume off image
        }

        // You can also implement functionality for muting/unmuting audio here if desired
        console.log("Volume is now " + (isVolumeOn ? "On" : "Off"));
    });

    // Handle the start button click to switch from the starting screen to the gameplay screen
    startButton.addEventListener("click", function() {
        // Hide the starting container
        document.getElementById("starting-container").style.display = "none";

        // Show the gameplay container
        document.getElementById("gameplay-screen").style.display = "flex";

        // Call the function to start the game (listen for click anywhere)
        startGame();
    });

    // Function to start the game when a click anywhere is detected
    function startGame() {
        const levelTextElement = document.getElementById("level-number");

        // Play the start sound
        if (isVolumeOn) {
            const startSound = new Audio("Sounds/startgame.mp3");
            startSound.play();
        }

        // Change the text to "Click Anywhere to Begin"
        levelTextElement.innerText = "Click Anywhere to Begin";

        // Add an event listener for a click anywhere to start the game
        document.getElementById("gameplay-screen").addEventListener("click", startGameAfterClick, { once: true });
    }
});

// Function to start the game after a click is detected
function startGameAfterClick() {
    const levelTextElement = document.getElementById("level-number");

    if (!isGameStarted) {  // Check if the game hasn't started yet
        isGameStarted = true;  // Set game as started
        levelTextElement.innerText = "Level " + level;  // Change text to show the level
        
        // Start the game logic
        nextSequence();
    }
}

// Panel clicks for game actions
const panels = document.getElementsByClassName("panel");
for (let i = 0; i < panels.length; i++) {
    panels[i].addEventListener("click", function() {
        // Block input if the game hasn't started yet or if the sequence is playing
        if (!isGameStarted || isSequencePlaying) return;

        var userChosenColor = this.classList[1].split("-")[0]; // Extract the color from class
        userClickedPattern.push(userChosenColor);

        // Play sound (optional, for each button click)
        playSound(userChosenColor);

        // Reset the timer each time the user clicks a panel
        resetTimer();

        // Check the answer
        checkAnswer(userClickedPattern.length - 1);
    });
}

// Play sound for each color
function playSound(color) {
    if (!isVolumeOn) return; // Only play sound if the volume is on

    let sound;
    switch(color) {
        case "green":
            sound = new Audio("Sounds/green.mp3");
            break;
        case "red":
            sound = new Audio("Sounds/red.mp3");
            break;
        case "yellow":
            sound = new Audio("Sounds/yellow.mp3");
            break;
        case "blue":
            sound = new Audio("Sounds/blue.mp3");
            break;
        default:
            console.log("No sound for color:", color);
            return;
    }
    sound.play();
}

// Check if the user's answer is correct
function checkAnswer(currentLevel) {
    if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
        // If the current input is correct
        if (userClickedPattern.length === gamePattern.length) {
            // When the user completes the sequence
            setTimeout(function () {
                nextSequence();
            }, 1000);
        }
    } else {
        // If the answer is incorrect, show "Game Over" screen
        gameOver();
    }
}

// Game over logic
function gameOver() {
    // Play the game over sound
    if (isVolumeOn) {
        const gameOverSound = new Audio("Sounds/gameover.mp3");
        gameOverSound.play();
    }

    // Hide the gameplay screen
    document.getElementById("gameplay-screen").style.display = "none";
    
    // Show the game over screen
    document.getElementById("game-over-container").style.display = "inline-block";

    // Reset the level
    document.getElementById("game-over-title").innerText = "Game Over!";

    // Add event listener for "Try Again" button
    document.getElementById("try-again-button").addEventListener("click", function() {
        // Hide the game over screen
        document.getElementById("game-over-container").style.display = "none";

        // Show the starting screen (or restart gameplay screen)
        document.getElementById("gameplay-screen").style.display = "flex";

        startOver();
    });
}

// Start the next sequence
function nextSequence() {
    // Set the flag to true when the sequence starts playing
    isSequencePlaying = true;

    // Reset user pattern for the new round
    userClickedPattern = [];
    
    // Increase the level
    level++;
    document.getElementById("level-number").innerText = "Level " + level;

    // Generate the next random color for the sequence
    const randomNumber = Math.floor(Math.random() * 4);
    const randomChosenColor = buttonColors[randomNumber];
    gamePattern.push(randomChosenColor);

    // Show the sequence with a delay for each color in the gamePattern
    for (let i = 0; i < gamePattern.length; i++) {
        (function(i) {
            setTimeout(function() {
                flashPanel(gamePattern[i]);
            }, 600 * i);
        })(i);
    }

    // After the sequence is finished, allow player input
    setTimeout(function() {
        // Set the flag to false after the sequence finishes
        isSequencePlaying = false;
    }, 600 * gamePattern.length); // This matches the length of the sequence
}

// Flash the panel during the sequence
function flashPanel(color) {
    const panel = document.querySelector(`.${color}-panel`);
    const originalBackground = panel.style.background;
    panel.style.background = 'white';  // Set background to solid white

    panel.classList.add("flash");
    panel.style.boxShadow = `inset 0px 0px 70px 4px ${color}`;

    if (isVolumeOn) {
        playSound(color);
    }

    setTimeout(function() {
        panel.classList.remove("flash");
        panel.style.boxShadow = "";  // Reset the box-shadow
        panel.style.background = originalBackground;  // Restore the original background
    }, 450); // Flash duration
}

// Timer logic
function startTimer() {
    clearTimeout(timer);
    timer = setTimeout(function() {
        document.getElementById("level-number").innerText = "Game Over!";
        setTimeout(function () {
            document.getElementById("level-number").innerText = "Press Any Key to Start";
        }, 200);

        gameOver();
    }, timeLimit);
}

// Reset the timer
function resetTimer() {
    clearTimeout(timer);
    startTimer();
}

// Reset game state
function startOver() {
    level = 0;
    gamePattern = [];
    userClickedPattern = [];
    document.getElementById("level-number").innerText = "Click Anywhere to Begin";

    isGameStarted = false;

    // Reattach the click event listener to the gameplay screen to restart the game
    document.getElementById("gameplay-screen").addEventListener("click", startGameAfterClick, { once: true });
}
