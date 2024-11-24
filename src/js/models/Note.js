// This is the main model for the notes
export class Note {
  // TODO: Add id
  constructor(content, url = null) {
    this.id = crypto.randomUUID();
    this.content = content;
    this.url = url;
    this.timestamp = new Date().toISOString();
  }
}
