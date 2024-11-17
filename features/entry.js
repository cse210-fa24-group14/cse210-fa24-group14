import { saveNote } from './saveNotes.js';
import { displayNotes } from './displayNotes.js';

const noteInput = document.getElementById("noteInput");
const saveBtn = document.getElementById("saveBtn");

// Initialize the notes display when the popup is opened
document.addEventListener("DOMContentLoaded", displayNotes);

// Handle saving notes
saveBtn.addEventListener("click", () => {
  const note = noteInput.value.trim();
  if (note) {
    saveNote(note, noteInput, displayNotes);
  }
});
