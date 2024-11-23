import { StorageService } from '../services/StorageService.js';
import { Note } from '../models/Note.js';

export class NoteRepository {
  constructor() {
    this.storageService = new StorageService();
    this.STORAGE_KEY = 'notes';
  }

  async getAllNotes() {
    const notes = await this.storageService.get(this.STORAGE_KEY, []);
    return notes.map(
      (note) => new Note(note.content, note.url, note.timestamp),
    );
  }

  async addNote(content, url) {
    const notes = await this.getAllNotes();
    const newNote = new Note(content, url);
    await this.storageService.set(this.STORAGE_KEY, [...notes, newNote]);
    return newNote;
  }

  async deleteNote(timestamp) {
    const notes = await this.getAllNotes();
    const filteredNotes = notes.filter((note) => note.timestamp !== timestamp);
    await this.storageService.set(this.STORAGE_KEY, filteredNotes);
  }
}
