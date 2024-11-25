import { parseMarkdown } from '../utils';

// This is the main component for the notes list view
export class NoteListView {
  constructor(containerElement) {
    this.container = containerElement; // DOM element to render the notes
    this.onDeleteNote = null; // Callback to be set by parent
  }

  // This is to set the callback for when a note is deleted in NoteListView
  setOnDeleteNote(callback) {
    this.onDeleteNote = callback;
  }

  render(notes) {
    this.container.innerHTML = '';

    if (notes.length === 0) {
      const emptyState = document.createElement('p');
      emptyState.className = 'empty-state';
      emptyState.textContent = 'No notes yet. Add your first note!';
      this.container.appendChild(emptyState);
      return;
    }

    notes.forEach((note) => {
      const li = document.createElement('li');
      li.className = 'note-item';

      const content = document.createElement('span');
      content.textContent = parseMarkdown(note.content);

      const deleteBtn = document.createElement('button');
      deleteBtn.setAttribute('aria-label', `Delete note ${note.content}`);
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', async () => {
        await this.handleDelete(note);
      });

      li.appendChild(content);
      li.appendChild(deleteBtn);
      this.container.appendChild(li);
    });
  }

  // This is to handle the deletion of a note, calling the callback set by the parent
  async handleDelete(note) {
    if (!this.onDeleteNote) return;
    try {
      await this.onDeleteNote(note.id);
    } catch (error) {
      this.showErrorToast(`Failed to delete note, please try again: ${error}`);
    }
  }

  showErrorToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}
