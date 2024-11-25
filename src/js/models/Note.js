// This is the main model for the notes
export class Note {
  // TODO: Add id
  constructor(url) {
    this.url = url;
    this.cells = [];
  }
}

export class NoteCell {
  constructor(timestamp, content, cellType) {
    this.content = content;
    this.cellType = cellType;
    this.timestamp = timestamp;
  }
}
