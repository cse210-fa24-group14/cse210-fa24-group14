/**
 * A repository layer for managing notes in IndexedDB.
 * Acts as a layer between the application's business logic and data storage.
 */
import { IndexedDBService } from '../services/IndexDBService.js';
import { Note, NoteCell } from '../models/Note.js';

// This is layer between our app's business logic and the data storage layer
export class NoteRepository {
  /**
   * Storage key for notes in IndexedDB.
   * @type {string}
   */
  static STORAGE_KEY = 'notes';

  /**
   * Initializes a new instance of NoteRepository.
   */
  constructor() {
    /**
     * @type {IndexedDBService}
     */
    this.indexDBService = new IndexedDBService();
  }

  /**
   * Removes all query parameters from a URL.
   * @param {string} url - The URL to clean.
   * @returns {string} The cleaned URL.
   */
  removeAllQueryParams(url) {
    // Ensure URL is a string and remove query parameters
    const cleanUrl = (url || '').split('?')[0].replace(/\/$/, '');
    return cleanUrl;
  }

  /**
   * Retrieves all notes from storage.
   * @returns {Promise<Note[]>} A promise that resolves to an array of notes.
   */
  async getAllNotes() {
    const notes = await this.indexDBService.get(NoteRepository.STORAGE_KEY, []);
    return notes;
  }

  /**
   * Retrieves a note by its URL.
   * @param {string} url - The URL of the note.
   * @returns {Promise<Note|undefined>} A promise that resolves to the note or undefined if not found.
   */
  async getNoteByUrl(url) {
    const newUrl = this.removeAllQueryParams(url);
    console.log(newUrl);
    const notes = await this.getAllNotes();
    return notes.find((note) => note.url === newUrl);
  }

  /**
   * Adds a new note for the given URL.
   * @param {string} url - The URL for the new note.
   * @returns {Promise<Note>} A promise that resolves to the newly created note.
   * @throws {Error} Throws an error if the note cannot be added.
   */
  async addNote(url) {
    try {
      const newUrl = this.removeAllQueryParams(url);
      const notes = await this.getAllNotes();
      const newNote = new Note(newUrl);
      await this.indexDBService.set(NoteRepository.STORAGE_KEY, [
        ...notes,
        newNote,
      ]);
      return newNote;
    } catch (error) {
      console.error('Failed to add note to storage:', error);
      throw error;
    }
  }

  /**
   * Adds a cell to a note.
   * @param {string} url - The URL of the note.
   * @param {number} timestamp - The timestamp of the new cell.
   * @param {string} content - The content of the new cell.
   * @param {string} cellType - The type of the cell (e.g., text, image).
   * @param {number} [targetTimestamp] - The timestamp of the target cell to insert after.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async addCellToNote(url, timestamp, content, cellType, targetTimestamp) {
    const notes = await this.getAllNotes();
    const newUrl = this.removeAllQueryParams(url);
    const noteToUpdate =
      notes.find((note) => note.url === newUrl) || (await this.addNote(newUrl));
    const newCell = new NoteCell(timestamp, content, cellType);
    if (noteToUpdate) {
      if (targetTimestamp) {
        // Find the target cell index
        const targetIndex = noteToUpdate.cells.findIndex(
          (cell) => cell.timestamp === targetTimestamp,
        );

        if (targetIndex !== -1) {
          // Insert the new cell after the target cell
          noteToUpdate.cells.splice(targetIndex + 1, 0, newCell);
        }
      } else {
        // If no targetTimestamp is provided, add at the end of the cells array
        noteToUpdate.cells.push(newCell);
      }
      await this.indexDBService.set(NoteRepository.STORAGE_KEY, notes);
    }
  }

  /**
   * Updates the content of a cell in a note.
   * @param {string} url - The URL of the note.
   * @param {number} timestamp - The timestamp of the cell to update.
   * @param {string} content - The new content for the cell.
   * @param {string} cellType - The new type of the cell.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async updateCellContent(url, timestamp, content, cellType) {
    const notes = await this.getAllNotes();
    const newUrl = this.removeAllQueryParams(url);
    const note = notes.find((note) => note.url === newUrl);

    if (!note || !note.cells) {
      console.error('Note not found while updating content.');
      return;
    }

    // Find the cell by timestamp and update its content
    const cell = note.cells.find((cell) => cell.timestamp === timestamp);
    if (cell) {
      cell.content = content;
      cell.cellType = cellType;

      // Save the updated note to the database
      await this.indexDBService.set(NoteRepository.STORAGE_KEY, notes);
      console.log('Updated cell content saved:', cell);
    } else {
      console.error('Cell not found for updating content.');
    }
  }

  /**
   * Deletes a cell from a note.
   * @param {string} url - The URL of the note.
   * @param {number} cellTimestamp - The timestamp of the cell to delete.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   * @throws {Error} Throws an error if the cell cannot be deleted.
   */
  async deleteCellFromNote(url, cellTimestamp) {
    try {
      const newUrl = this.removeAllQueryParams(url);
      const notes = await this.getAllNotes();
      const noteToUpdate =
        notes.find((note) => note.url === newUrl) || this.addNote(newUrl);
      if (noteToUpdate) {
        noteToUpdate.cells = noteToUpdate.cells.filter(
          (cell) => cell.timestamp !== cellTimestamp,
        );
        await this.indexDBService.set(NoteRepository.STORAGE_KEY, notes);
      }
    } catch (error) {
      console.error('Failed to delete note from storage:', error);
      throw error;
    }
  }
}
