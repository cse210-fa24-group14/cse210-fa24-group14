import { NoteRepository } from './repositories/NoteRepository.js';
import { NoteListView } from './components/NoteListView.js';

// This is the main app/entry point
class NotesApp {
  constructor() {
    // This is the where the notes are stored (communication with backend)
    this.noteRepository = new NoteRepository();
    // This is the where the notes are displayed
    this.noteListView = new NoteListView(document.getElementById('notesList'));

    // This is where the notes are inputted.
    // We can also extract this to a component, but when it gets more complex.
    this.noteInput = document.getElementById('noteInput');
    this.saveButton = document.getElementById('saveBtn');

    this.initialize();
  }

  async initialize() {
    try {
      await this.loadNotes();
      this.setupEventListeners();
    } catch (error) {
      console.error('Error in initializing app', error);
    }
  }

  async loadNotes() {
    const notes = await this.noteRepository.getAllNotes();
    this.noteListView.render(notes);
  }

  setupEventListeners() {
    this.saveButton.addEventListener('click', () => this.handleSaveNote());
    // This is to set the callback for when a note is deleted in NoteListView
    this.noteListView.setOnDeleteNote((timestamp) =>
      this.handleDeleteNote(timestamp),
    );
  }

  async handleSaveNote() {
    const content = this.noteInput.value.trim();
    if (content) {
      try {
        await this.noteRepository.addNote(content);
        this.noteInput.value = '';
        await this.loadNotes();
      } catch (error) {
        console.error('Error in handling save note', error);
      }
    }
  }

  async handleDeleteNote(timestamp) {
    try {
      await this.noteRepository.deleteNote(timestamp);
      await this.loadNotes();
    } catch (error) {
      console.error('Error in handling delete note', error);
    }
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new NotesApp();
});
