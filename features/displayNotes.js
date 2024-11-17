import { deleteNote } from "./deleteNotes.js"; 

export function displayNotes() {
  const notesList = document.getElementById("notesList");

  chrome.storage.sync.get({ notes: [] }, (data) => {
    notesList.innerHTML = ""; // Clear the list

    data.notes.forEach((note, index) => {
      const listItem = document.createElement("li");
      listItem.textContent = note;

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.style.marginLeft = "10px";

      // Add the delete button functionality
      deleteBtn.addEventListener("click", () => {
        deleteNote(index); // Delete the note
        displayNotes(); // Refresh the notes list
      });

      listItem.appendChild(deleteBtn);
      notesList.appendChild(listItem);
    });
  });
}
