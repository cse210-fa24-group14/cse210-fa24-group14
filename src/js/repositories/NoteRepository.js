import { StorageService } from '../services/StorageService.js';
import { Note, NoteCell } from '../models/Note.js';

// This is layer between our app's business logic and the data storage layer
export class NoteRepository {
  constructor() {
    this.storageService = new StorageService();
    this.STORAGE_KEY = 'notes';
  }

  async getAllNotes() {
    const notes = await this.storageService.get(this.STORAGE_KEY, []);
    return notes;
  }

  async getNoteByUrl(url) {
    const notes = await this.getAllNotes();
    return notes.find((note) => note.url === url);
  }

  async addNote(url) {
    const notes = await this.getAllNotes();
    const newNote = new Note(url);
    await this.storageService.set(this.STORAGE_KEY, [...notes, newNote]);
    return newNote;
  }

  async addCellToNote(url, timestamp, content, cellType, targetTimestamp) {
    const notes = await this.getAllNotes();
    const noteToUpdate = notes.find((note) => note.url === url) || this.addNote(url);
    const newCell = new NoteCell(timestamp, content, cellType);
    if(noteToUpdate){
      if (targetTimestamp) {
        // Find the target cell index
        const targetIndex = noteToUpdate.cells.findIndex(cell => cell.timestamp === targetTimestamp);
        
        if (targetIndex !== -1) {
          // Insert the new cell after the target cell
          noteToUpdate.cells.splice(targetIndex, 0, newCell);
        }
      } 
      else {
        // If no targetTimestamp is provided, add at the end of the cells array
        noteToUpdate.cells.push(newCell);
      }
      await this.storageService.set(this.STORAGE_KEY, notes);
    }
  }

  async updateCellContent(url, timestamp, content, cellType) {
    const notes = await this.getAllNotes();
    const note = notes.find((note) => note.url === url);
    
    if (!note || !note.cells) {
      console.error('Note not found while updating content.');
      return;
    }
  
    // Find the cell by timestamp and update its content
    const cell = note.cells.find(cell => cell.timestamp === timestamp);
    if (cell) {
      cell.content = content;
      cell.cellType = cellType;
  
      // Save the updated note to the database
      await this.storageService.set(this.STORAGE_KEY, notes);
      console.log('Updated cell content saved:', cell);
    } else {
      console.error('Cell not found for updating content.');
    }
  }

  async deleteCellFromNote(url, cellTimestamp) {
    const notes = await this.getAllNotes();
    const noteToUpdate = notes.find((note) => note.url === url) || this.addNote(url);
    if(noteToUpdate){
      noteToUpdate.cells = noteToUpdate.cells.filter((cell) => cell.timestamp !== cellTimestamp);
      await this.storageService.set(this.STORAGE_KEY, notes);
    }
    
  }
}