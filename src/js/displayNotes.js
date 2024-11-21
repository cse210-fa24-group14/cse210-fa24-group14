import { fetchNotes, deleteNote } from './utils.js';

export async function displayNotes(notesList) {
  const notes = await fetchNotes();
  notesList.innerHTML = ''; // Clear existing notes

  notes.forEach((note, index) => {
    const noteCell = document.createElement('div'); // Create the note container
    noteCell.className = 'note-cell';

    // Create the note text area
    const noteText = document.createElement('textarea');
    noteText.className = 'note-text';
    noteText.value = note; // Set the note content
    noteText.readOnly = true; // Make the text area read-only to prevent editing

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'note-delete-btn';
    deleteBtn.addEventListener('click', async () => {
      await deleteNote(index);
      await displayNotes(notesList); // Re-display notes after deletion
    });

    noteCell.appendChild(noteText);
    noteCell.appendChild(deleteBtn);

    // Add the note cell to the list
    notesList.appendChild(noteCell);
  });
}
