import { NoteRepository } from './repositories/NoteRepository.js';
import { NoteListView } from './components/NoteListView.js';

class NotesApp {
  constructor() {
    this.noteRepository = new NoteRepository();
    this.noteListView = new NoteListView(document.getElementById('notesList'));
    this.noteInput = document.getElementById('noteInput');
    this.saveButton = document.getElementById('saveBtn');

    this.initialize();
  }

  async initialize() {
    await this.loadNotes();
    this.setupEventListeners();
  }

  async loadNotes() {
    const notes = await this.noteRepository.getAllNotes();
    console.log(notes);
    this.noteListView.render(notes);
  }

  setupEventListeners() {
    this.saveButton.addEventListener('click', () => this.handleSaveNote());
    this.noteListView.setOnDeleteNote((timestamp) =>
      this.handleDeleteNote(timestamp),
    );
  }

  async handleSaveNote() {
    const content = this.noteInput.value.trim();
    if (content) {
      console.log(content);
      await this.noteRepository.addNote(content);
      this.noteInput.value = '';
      await this.loadNotes();
    }
  }

  async handleDeleteNote(timestamp) {
    await this.noteRepository.deleteNote(timestamp);
    await this.loadNotes();
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new NotesApp();
});
