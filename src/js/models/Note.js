export class Note {
  // TODO: Add id
  constructor(content, url = null, timestamp = new Date().toISOString()) {
    this.content = content;
    this.url = url;
    this.timestamp = timestamp;
  }
}
