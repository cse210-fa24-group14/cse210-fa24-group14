// Fetch notes from storage
export async function fetchNotes() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ notes: [] }, (data) => {
      resolve(data.notes);
    });
  });
}

// Update notes in storage
export async function updateNotes(updatedNotes) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ notes: updatedNotes }, resolve);
  });
}

// Delete a note by index
export async function deleteNote(index) {
  const notes = await fetchNotes();
  const updatedNotes = notes.filter((_, i) => i !== index);
  await updateNotes(updatedNotes);
}
