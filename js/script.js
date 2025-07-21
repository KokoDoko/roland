import chordSets from './chord-sets.json' with { type: "json" };
import { Synth } from "./synth.js"

const keys = document.querySelectorAll(".key")
const setChordsToggle = document.querySelector("#setchords")
const arpeggioToggle = document.querySelector("#arpeggio")
const chordInput = document.querySelector("#chordset")
const genrelabel = document.querySelector("#genre")
const chordDisplay = document.querySelector(".chord-display")
const clearButton = document.querySelector("button")

let selectedChord = 0
let timerInterval
let arp = false
let soundMode = false
let synth = new Synth()

// todo still not the right place for await Tone.start

clearButton.addEventListener("click", clearChordDisplay)

setChordsToggle.addEventListener("change", async (e) => {
    soundMode = e.target.checked
    if (Tone.context.state !== 'running') {
        await Tone.start()
    }
})

arpeggioToggle.addEventListener("change", async (e) => {
    arp = e.target.checked
    if (Tone.context.state !== 'running') {
        await Tone.start()
    }
})

chordInput.addEventListener("change", async (e)=> {
    let num = parseInt(e.target.value) -1
    genrelabel.innerText = chordSets[num].name
    selectedChord = parseInt(e.target.value) - 1
    clearChordDisplay()
    if (Tone.context.state !== 'running') {
        await Tone.start()
    }
})

// here we use the computer keyboard to play sounds
// C = C, V = D, B = E, N = F, M = G, , = A, . = B
function createKeyboardInput(){
    const keyMapping = {
        // White keys (bottom row)
        'KeyC': 'C4',
        'KeyV': 'D4', 
        'KeyB': 'E4',
        'KeyN': 'F4',
        'KeyM': 'G4',
        'Comma': 'A4',
        'Period': 'B4',
        // Black keys (top row)
        'KeyF': 'C#4',
        'KeyG': 'D#4',
        'KeyH': 'F#4',
        'KeyJ': 'G#4',
        'KeyK': 'A#4'
    };

    document.addEventListener('keydown', (e) => {
        const note = keyMapping[e.code];
        if (note) {
            keyPressed(note);
        }
    });
}



//
// Display chord information in the chord-display section
//
function displayChordInfo(chordInfo, notes) {
    const noteDisplay = document.createElement("div")
    noteDisplay.className = "note-display"
    
    const notesText = notes.join(", ")
    noteDisplay.innerHTML = `${notesText} <span class="chordname">${chordInfo.name}</span>`
    
    chordDisplay.appendChild(noteDisplay)
}

//
// Clear chord display
//
function clearChordDisplay() {
    chordDisplay.innerHTML = ""
    removeDots()
    removeHighlights()
}

//
// highlight chord keys on the keyboard
//
function highLightKeys(chord) {
    for (let key of chord) {
        const element = document.querySelector(`div[data-note="${key}"]`);
        if(element) {
            element.classList.add("activekey");  // some notes such as F2 do not exist on the keyboard
            element.classList.add("show-dot");
        }
    }
}
function removeHighlights() {
    for (let key of keys) {
        key.classList.remove("activekey");
    }
}
function removeDots() {
    for (let key of keys) {
        key.classList.remove("show-dot");
    }
}
//
// make keyboard playable
//
function initKeyboard() {
    for (let key of keys) {
        key.addEventListener("click", (e) => keyPressed(e.target.dataset.note))
    }
}

async function keyPressed(note){
    clearInterval(timerInterval)
    removeHighlights()

    if (soundMode) {
        synth.playNote(note)
        highLightKeys([note])
    } else {
        // remove octave info to search in the json file, also replace # with "s" to search 
        let noteForChord = note.replace(/[0-9]/g, "").replace("#", "s");
        let chordInfo = (chordSets[selectedChord].chords[noteForChord])
        let chord = chordInfo.notes
        synth.playChord(chord, "2n", arp); 
        highLightKeys(chord);
        
        // Display chord information
        displayChordInfo(chordInfo, chord)
    }

    timerInterval = setTimeout(removeHighlights, 2000);
}

initKeyboard()
createKeyboardInput()




