// This is the main model for the notes
export class Note {
  // TODO: Add id
  constructor(content, url = null, id = null) {
    this.id = id || new Date().toISOString();
    this.content = content;
    this.url = url;
  }
}
