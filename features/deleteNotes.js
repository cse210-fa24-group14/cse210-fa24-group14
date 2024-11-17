export function deleteNote(index) {
    chrome.storage.sync.get({ notes: [] }, (data) => {
      const updatedNotes = data.notes.filter((_, i) => i !== index);
      chrome.storage.sync.set({ notes: updatedNotes }, () => {
        console.log("Note deleted successfully.");
      });
    });
  }
  