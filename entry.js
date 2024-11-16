const noteInput = document.getElementById("noteInput");
const saveBtn = document.getElementById("saveBtn");
const notesList = document.getElementById("notesList");

// Save the note
saveBtn.addEventListener("click", () => {
  const note = noteInput.value.trim();
  if (note) {
    chrome.storage.sync.get({ notes: [] }, (data) => {
      const updatedNotes = [...data.notes, note];
      chrome.storage.sync.set({ notes: updatedNotes }, () => {
        noteInput.value = ""; // Clear input
        displayNotes(); // Refresh notes list
      });
    });
  }
});

// Display saved notes
function displayNotes() {
  chrome.storage.sync.get({ notes: [] }, (data) => {
    notesList.innerHTML = "";
    data.notes.forEach((note, index) => {
      const listItem = document.createElement("li");
      listItem.textContent = note;

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.style.marginLeft = "10px";
      deleteBtn.addEventListener("click", () => {
        deleteNote(index);
      });

      listItem.appendChild(deleteBtn);
      notesList.appendChild(listItem);
    });
  });
}

// Delete a note
function deleteNote(index) {
  chrome.storage.sync.get({ notes: [] }, (data) => {
    const updatedNotes = data.notes.filter((_, i) => i !== index);
    chrome.storage.sync.set({ notes: updatedNotes }, () => {
      displayNotes();
    });
  });
}

// Load notes on popup open
document.addEventListener("DOMContentLoaded", displayNotes);
