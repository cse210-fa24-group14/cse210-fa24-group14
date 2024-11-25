import { StorageService } from '../services/StorageService.js';
import { Note } from '../models/Note.js';

// This is layer between our app's business logic and the data storage layer
export class NoteRepository {
  static STORAGE_KEY = 'notes';

  constructor() {
    this.storageService = new StorageService();
  }

  async getAllNotes() {
    try {
      const notes = await this.storageService.get(
        NoteRepository.STORAGE_KEY,
        [],
      );
      return notes;
    } catch (error) {
      console.error('Failed to retrieve notes from storage:', error);
      throw error;
    }
  }

  async addNote(content, url) {
    try {
      const notes = await this.getAllNotes();
      const newNote = new Note(content, url);
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

  async deleteNote(id) {
    try {
      const notes = await this.getAllNotes();
      const filteredNotes = notes.filter((note) => note.id !== id);
      await this.storageService.set(NoteRepository.STORAGE_KEY, filteredNotes);
    } catch (error) {
      console.error('Failed to delete note from storage:', error);
      throw error;
    }
  }
}
