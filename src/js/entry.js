import { NoteRepository } from './repositories/NoteRepository.js';
import { NotesView } from './components/NotesView.js';
import { DarkModeComponent } from './components/DarkModeComponent.js';

/**
 * Main application class for managing notes.
 */
class NotesApp {
  constructor() {
    // This is the where the notes are stored (communication with backend)
    this.noteRepository = new NoteRepository();
    // This is the where the notes are displayed
    this.notesView = new NotesView(document.getElementById('container'));
    // This is the service for managing dark mode
    this.darkModeComponent = new DarkModeComponent();

    this.initialize();
  }

  /**
   * Initializes the application by setting up event listeners,
   * loading notes, and configuring the dark mode.
   * @returns {Promise<void>}
   */
  async initialize() {
    this.setupEventListeners();
    await this.loadNotes();

    this.darkModeComponent.initializeSystemTheme(); // Sync with system theme
    this.darkModeComponent.initializeManualThemeToggle(
      document.querySelector('#container'), // Pass the container for the toggle button
    );
  }

  /**
   * Loads notes for the current URL and renders them in the view.
   * @returns {Promise<void>}
   */
  async loadNotes() {
    try {
      const url = await this.getUrl();
      const note =
        (await this.noteRepository.getNoteByUrl(url)) ||
        (await this.noteRepository.addNote(url));
      console.log('Inside load notes: ', note);
      await this.notesView.render(note);
    } catch (error) {
      console.error('Error in loading notes', error);
    }
  }

  /**
   * Sets up event listeners for adding, deleting, and updating cells.
   */
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

  /**
   * Handles adding a new cell to a note.
   *
   * @param {string} timestamp - The timestamp of the cell.
   * @param {string} content - The content of the cell.
   * @param {string} cellType - The type of the cell (e.g., "text", "code").
   * @param {string} targetTimestamp - The timestamp of the target cell for positioning.
   * @returns {Promise<void>}
   */
  async handleAddCell(timestamp, content, cellType, targetTimestamp) {
    try {
      await this.noteRepository.addCellToNote(
        await this.getUrl(),
        timestamp,
        content,
        cellType,
        targetTimestamp,
      );
    } catch (error) {
      console.error('Error in adding new cell to the note', error);
    }
  }
  /**
   * Handles deleting a cell from a note.
   *
   * @param {string} timestamp - The timestamp of the cell to delete.
   * @returns {Promise<void>}
   */
  async handleDeleteCell(timestamp) {
    try {
      await this.noteRepository.deleteCellFromNote(
        await this.getUrl(),
        timestamp,
      );
    } catch (error) {
      console.error('Error in deleting cell from the note', error);
    }
  }

  /**
   * Handles updating the content of a cell in a note.
   *
   * @param {string} timestamp - The timestamp of the cell to update.
   * @param {string} content - The updated content of the cell.
   * @param {string} cellType - The type of the cell (e.g., "text", "code").
   * @returns {Promise<void>}
   */
  async handleUpdateCell(timestamp, content, cellType) {
    try {
      await this.noteRepository.updateCellContent(
        await this.getUrl(),
        timestamp,
        content,
        cellType,
      );
    } catch (error) {
      console.error('Error in saving cell content to the note', error);
    }
  }
  /**
   * Retrieves the URL of the active browser tab.
   *
   * @returns {Promise<string>} The URL of the active tab.
   */
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
