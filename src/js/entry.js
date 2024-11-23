import { displayNotes } from './displayNotes.js';
import { saveNote } from './saveNotes.js';
import {
  initializeSystemTheme,
  initializeManualThemeToggle,
} from './darkModeSwap.js';

document.addEventListener('DOMContentLoaded', () => {
  const notesList = document.getElementById('notesList');
  const saveButton = document.getElementById('saveBtn');
  const noteInput = document.getElementById('noteInput');

  // Initialize auto theme change
  initializeSystemTheme();
  // Initialize manual theme change with button
  initializeManualThemeToggle();

  // Initial display of notes
  displayNotes(notesList);

  // Save new note when button is clicked
  saveButton.addEventListener('click', async () => {
    const newNote = noteInput.value;
    console.log(newNote);
    if (newNote) {
      await saveNote(newNote, notesList);
      noteInput.value = ''; // Clear input field after saving
    }
  });
});
