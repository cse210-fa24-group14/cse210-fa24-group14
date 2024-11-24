import { StorageService } from '../services/StorageService.js';
import { Note } from '../models/Note.js';

// This is layer between our app's business logic and the data storage layer
export class NoteRepository {
  constructor() {
    this.storageService = new StorageService();
    this.STORAGE_KEY = 'notes';
  }

  async getAllNotes() {
    try {
      const notes = await this.storageService.get(this.STORAGE_KEY, []);
      return notes.map(
        (note) => new Note(note.content, note.url, note.timestamp),
      );
    } catch (error) {
      console.error('Failed to retrieve notes from storage:', error);
      throw error;
    }
  }

  async addNote(content, url) {
    try {
      const notes = await this.getAllNotes();
      const newNote = new Note(content, url);
      await this.storageService.set(this.STORAGE_KEY, [...notes, newNote]);
      return newNote;
    } catch (error) {
      console.error('Failed to add note to storage:', error);
      throw error;
    }
  }

  async deleteNote(timestamp) {
    try {
      const notes = await this.getAllNotes();
      const filteredNotes = notes.filter(
        (note) => note.timestamp !== timestamp,
      );
      await this.storageService.set(this.STORAGE_KEY, filteredNotes);
    } catch (error) {
      console.error('Failed to delete note from storage:', error);
      throw error;
    }
  }
}
