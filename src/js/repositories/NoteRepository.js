import { StorageService } from '../services/StorageService.js';
import { Note, NoteCell } from '../models/Note.js';

// This is layer between our app's business logic and the data storage layer
export class NoteRepository {
  static STORAGE_KEY = 'notes';
  constructor() {
    /**
     * Instance of the storage service to interact with Chrome storage.
     * @type {StorageService}
     */
    this.storageService = new StorageService();
  }

  /**
   * Retrieves all notes from storage.
   *
   * @returns {Promise<Note[]>} A promise that resolves with an array of notes.
   */
  async getAllNotes() {
    const notes = await this.storageService.get(NoteRepository.STORAGE_KEY, []);
    return notes;
  }

  /**
   * Retrieves a note by its URL.
   *
   * @param {string} url - The URL of the note to retrieve.
   * @returns {Promise<Note | undefined>} A promise that resolves with the note or undefined if not found.
   */
  async getNoteByUrl(url) {
    const notes = await this.getAllNotes();
    return notes.find((note) => note.url === url);
  }

  /**
   * Adds a new note with the given URL.
   *
   * @param {string} url - The URL of the note to add.
   * @returns {Promise<Note>} A promise that resolves with the newly created note.
   * @throws {Error} If there is an issue adding the note to storage.
   */
  async addNote(url) {
    try {
      const notes = await this.getAllNotes();
      const newNote = new Note(url);
      await this.storageService.set(NoteRepository.STORAGE_KEY, [
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
   * Adds a new cell to an existing note by URL.
   *
   * @param {string} url - The URL of the note to update.
   * @param {number} timestamp - The timestamp of the new cell.
   * @param {string} content - The content of the new cell.
   * @param {string} cellType - The type of the new cell (e.g., text, code).
   * @param {number} [targetTimestamp] - The timestamp of the cell after which the new cell should be added.
   * @returns {Promise<void>} A promise that resolves when the cell is added.
   */
  async addCellToNote(url, timestamp, content, cellType, targetTimestamp) {
    const notes = await this.getAllNotes();
    const noteToUpdate =
      notes.find((note) => note.url === url) || (await this.addNote(url));
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
      await this.storageService.set(NoteRepository.STORAGE_KEY, notes);
    }
  }

  /**
   * Updates the content of an existing cell in a note by URL.
   *
   * @param {string} url - The URL of the note.
   * @param {number} timestamp - The timestamp of the cell to update.
   * @param {string} content - The new content for the cell.
   * @param {string} cellType - The type of the cell (e.g., text, code).
   * @returns {Promise<void>} A promise that resolves when the cell is updated.
   */
  async updateCellContent(url, timestamp, content, cellType) {
    const notes = await this.getAllNotes();
    const note = notes.find((note) => note.url === url);

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
      await this.storageService.set(NoteRepository.STORAGE_KEY, notes);
      console.log('Updated cell content saved:', cell);
    } else {
      console.error('Cell not found for updating content.');
    }
  }

  /**
   * Deletes a cell from a note by URL and cell timestamp.
   *
   * @param {string} url - The URL of the note.
   * @param {number} cellTimestamp - The timestamp of the cell to delete.
   * @returns {Promise<void>} A promise that resolves when the cell is deleted.
   * @throws {Error} If there is an issue deleting the cell.
   */
  async deleteCellFromNote(url, cellTimestamp) {
    try {
      const notes = await this.getAllNotes();
      const noteToUpdate =
        notes.find((note) => note.url === url) || this.addNote(url);
      if (noteToUpdate) {
        noteToUpdate.cells = noteToUpdate.cells.filter(
          (cell) => cell.timestamp !== cellTimestamp,
        );
        await this.storageService.set(NoteRepository.STORAGE_KEY, notes);
      }
    } catch (error) {
      console.error('Failed to delete note from storage:', error);
      throw error;
    }
  }
}
