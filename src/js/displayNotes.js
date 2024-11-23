import { fetchNotes, deleteNote } from './utils.js';
import { parseMarkdown } from './markdown.js';

export async function displayNotes(notesList) {
  const notes = await fetchNotes();
  notesList.innerHTML = ''; // Clear existing notes

  notes.forEach((note, index) => {
    const listItem = document.createElement('li');
    listItem.innerHTML = parseMarkdown(note); // Parse Markdown to HTML

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', async () => {
      await deleteNote(index);
      await displayNotes(notesList); // Re-display notes after deletion
    });

    listItem.appendChild(deleteBtn);
    notesList.appendChild(listItem);
  });
}