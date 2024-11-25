// This is the main model for the notes
export class Note {
  constructor(content, url = null, id = null) {
    this.id = id || new Date().toISOString();
    this.content = content;
    this.url = url;
  }
}

export class NoteCell {
  constructor(timestamp, content, cellType) {
    this.content = content;
    this.cellType = cellType;
    this.timestamp = timestamp;
  }
}
