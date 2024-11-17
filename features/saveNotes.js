export function saveNote(note, noteInput, displayNotes) {
    chrome.storage.sync.get({ notes: [] }, (data) => {
      const updatedNotes = [...data.notes, note];
      chrome.storage.sync.set({ notes: updatedNotes }, () => {
        console.log("Note saved successfully.");
        noteInput.value = ""; // Clear the input field
        displayNotes(); // Refresh the notes list
      });
    });
  }