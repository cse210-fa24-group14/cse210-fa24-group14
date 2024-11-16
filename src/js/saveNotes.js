import { fetchNotes, updateNotes } from './crudNotes.js';

export async function saveNote(newNote, notesList) {
  const notes = await fetchNotes();
  const updatedNotes = [...notes, newNote];
  await updateNotes(updatedNotes);
  await displayNotes(notesList); // Re-display notes after saving
}
