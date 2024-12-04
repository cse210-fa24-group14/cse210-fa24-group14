// This is the main model for the notes
export class Note {
  constructor(url = null) {
    // this.id = id || new Date().toISOString(); The url to cells can be a unique map?
    this.cells = [];
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
