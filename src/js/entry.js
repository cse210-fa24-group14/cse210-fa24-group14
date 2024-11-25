import { NoteRepository } from './repositories/NoteRepository.js';
import { NotesView } from './components/NotesView.js';

// This is the main app/entry point
class NotesApp {
  constructor() {
    // This is the where the notes are stored (communication with backend)
    this.noteRepository = new NoteRepository();
    // This is the where the notes are displayed
    this.notesView = new NotesView(document.getElementById('container'));

    this.initialize();
  }

  async initialize() {
    this.setupEventListeners();
    await this.loadNotes();
  }

  async loadNotes() {
    const url = await this.getUrl();
    const note =
      (await this.noteRepository.getNoteByUrl(url)) ||
      (await this.noteRepository.addNote(url));
    console.log('Inside load notes: ', note);
    await this.notesView.render(note);
  }

  setupEventListeners() {
    this.notesView.setOnDeleteCell(
      async (timestamp) => await this.handleDeleteCell(timestamp),
    );
    this.notesView.setOnAddCell(
      async (timestamp, content, cellType, targetTimestamp) =>
        await this.handleAddCell(timestamp, content, cellType, targetTimestamp),
    );
    this.notesView.setOnUpdateCell(
      async (timestamp, content, cellType) =>
        await this.handleUpdateCell(timestamp, content, cellType),
    );
  }

  async handleAddCell(timestamp, content, cellType, targetTimestamp) {
    await this.noteRepository.addCellToNote(
      await this.getUrl(),
      timestamp,
      content,
      cellType,
      targetTimestamp,
    );
  }

  async handleDeleteCell(timestamp) {
    await this.noteRepository.deleteCellFromNote(
      await this.getUrl(),
      timestamp,
    );
  }

  async handleUpdateCell(timestamp, content, cellType) {
    await this.noteRepository.updateCellContent(
      await this.getUrl(),
      timestamp,
      content,
      cellType,
    );
  }

  async getUrl() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    return tab.url;
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new NotesApp();
});
