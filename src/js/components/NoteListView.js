export class NoteListView {
  constructor(containerElement) {
    this.container = containerElement; // DOM element to render the notes
    this.onDeleteNote = null; // Callback to be set by parent
  }

  setOnDeleteNote(callback) {
    this.onDeleteNote = callback;
  }

  render(notes) {
    this.container.innerHTML = '';

    if (notes.length === 0) {
      this.container.innerHTML =
        '<p class="empty-state">No notes yet. Add your first note!</p>';
      return;
    }

    notes.forEach((note) => {
      const li = document.createElement('li');
      li.className = 'note-item';

      const content = document.createElement('span');
      content.textContent = note.content;

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', async () => {
        await this.handleDelete(note);
      });

      li.appendChild(content);
      li.appendChild(deleteBtn);
      this.container.appendChild(li);
    });
  }

  async handleDelete(note) {
    if (!this.onDeleteNote) return;
    await this.onDeleteNote(note.timestamp);
  }
}
