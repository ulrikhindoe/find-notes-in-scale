const keys = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
const degrees = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th"];
const naturalMinorIntervals = [0, 2, 3, 5, 7, 8, 10];

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playNoteSafely(frequency) {
    if (!frequency) {
        console.error("Invalid frequency provided to playNote.");
        return;
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
}

const noteFrequencies = {
    "C": 261.63,
    "C#": 277.18,
    "Db": 277.18,
    "D": 293.66,
    "D#": 311.13,
    "Eb": 311.13,
    "E": 329.63,
    "F": 349.23,
    "F#": 369.99,
    "Gb": 369.99,
    "G": 392.00,
    "G#": 415.30,
    "Ab": 415.30,
    "A": 440.00,
    "A#": 466.16,
    "Bb": 466.16,
    "B": 493.88
};

let currentKey = null;
let exerciseInterval = null;
let lastDegreeIndex = null;

function updateCurrentKeyDisplay() {
    document.getElementById("currentKey").textContent = `Current Key: ${currentKey || "None"} natural minor`;
}

function isKeySharp(key) {
    return ["C#", "E", "F#", "G#", "B"].includes(key);
}

function isKeyFlat(key) {
    return ["C", "D", "Eb", "F", "G", "A", "Bb"].includes(key);
}

function getNoteName(noteIndex, useSharps) {
    const sharpNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const flatNotes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    return useSharps ? sharpNotes[noteIndex] : flatNotes[noteIndex];
}

// Update progress indicator
function updateProgress(current, total) {
    document.getElementById("progress").textContent = `Progress: ${current}/${total}`;
}

// Update the output to always show the degree and conditionally show the note
function updateOutput(degree, note = "") {
    document.getElementById("output").textContent = `Degree: ${degree} ${note ? "| Note: " + note : ""}`;
}

// Update the currentKey display whenever a new key is picked
function pickRandomKey() {
    const randomIndex = Math.floor(Math.random() * keys.length);
    currentKey = keys[randomIndex];
    document.getElementById("output").textContent = ``;
    updateCurrentKeyDisplay();
}

document.getElementById("randomKeyButton").addEventListener("click", pickRandomKey);

document.getElementById("startButton").addEventListener("click", () => {
    if (exerciseInterval) {
        clearInterval(exerciseInterval); // Stop the current exercise
        exerciseInterval = null;
    }

    if (!currentKey) {
        alert("Please pick a key first!");
        return;
    }

    // Clear the output box when the start button is clicked
    document.getElementById("output").textContent = "";

    const delay = parseDelayValue(document.getElementById("delaySelect").value) * 1000;
    const stepCount = parseInt(document.getElementById("stepCount").value);
    const useSharps = isKeySharp(currentKey);
    const playSound = document.getElementById("playSound").value === "true"; // Correctly parse the dropdown value

    let count = 0;
    updateProgress(count, stepCount);

    exerciseInterval = setInterval(() => {
        if (count >= stepCount) {
            clearInterval(exerciseInterval);
            exerciseInterval = null; // Ensure the interval is cleared
            return; // Exit the function to prevent extra notes
        }

        let randomDegreeIndex;
        do {
            randomDegreeIndex = Math.floor(Math.random() * degrees.length);
        } while (randomDegreeIndex === lastDegreeIndex);

        lastDegreeIndex = randomDegreeIndex;

        const degree = degrees[randomDegreeIndex];
        const noteIndex = (keys.indexOf(currentKey) + naturalMinorIntervals[randomDegreeIndex]) % 12;
        const note = getNoteName(noteIndex, useSharps);

        updateOutput(degree); // Show only the degree initially

        setTimeout(() => {
            if (count <= stepCount) { // Adjust condition to include the last step
                updateOutput(degree, note); // Add the note after the delay
                if (playSound) {
                    playNoteSafely(noteFrequencies[note]); // Play sound only if enabled
                }
            }
        }, delay);

        count++;
        updateProgress(count, stepCount);
    }, delay + 1000);

    // Immediately show the first degree
    if (count < stepCount) {
        let randomDegreeIndex;
        do {
            randomDegreeIndex = Math.floor(Math.random() * degrees.length);
        } while (randomDegreeIndex === lastDegreeIndex);

        lastDegreeIndex = randomDegreeIndex;

        const degree = degrees[randomDegreeIndex];
        const noteIndex = (keys.indexOf(currentKey) + naturalMinorIntervals[randomDegreeIndex]) % 12;
        const note = getNoteName(noteIndex, useSharps);

        updateOutput(degree); // Show the first degree immediately

        setTimeout(() => {
            if (count < stepCount) {
                updateOutput(degree, note);
                if (playSound) {
                    playNoteSafely(noteFrequencies[note]); // Play sound only if enabled
                }
            }
        }, delay);

        count++;
        updateProgress(count, stepCount);
    }
});

document.getElementById("stopButton").addEventListener("click", () => {
    if (exerciseInterval) {
        clearInterval(exerciseInterval); // Stop the interval
        exerciseInterval = null; // Reset the interval variable
        lastDegreeIndex = null; // Reset the last degree index
        document.getElementById("output").textContent = "Exercise stopped."; // Update the UI
        updateProgress(0, 0); // Reset the progress indicator
    } else {
        document.getElementById("output").textContent = "No exercise is currently running."; // Inform the user
    }
});

document.getElementById("delaySelect").addEventListener("input", (event) => {
    const inputField = event.target;
    const cursorPosition = inputField.selectionStart; // Save the cursor position
    inputField.value = inputField.value.replace(",", "."); // Replace commas with periods
    inputField.setSelectionRange(cursorPosition, cursorPosition); // Restore the cursor position
});

// Automatically pick a random key when the page is loaded
window.addEventListener("load", pickRandomKey);

function parseDelayValue(value) {
    return parseFloat(value.replace(",", ".")); // Ensure both commas and periods are accepted
}