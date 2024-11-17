import { fetchNotes, updateNotes } from './utils.js';
import { displayNotes } from './displayNotes.js';

export async function saveNote(newNote, notesList) {
  const notes = await fetchNotes();
  const updatedNotes = [...notes, newNote];
  await updateNotes(updatedNotes);
  await displayNotes(notesList); // Re-display notes after saving
}
