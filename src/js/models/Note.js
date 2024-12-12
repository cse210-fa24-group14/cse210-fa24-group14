// This is the main model for the notes
/**
 * Represents a note, which contains a collection of note cells.
 */
export class Note {
  /**
   * Creates a new Note instance.
   *
   * @param {string|null} [url=null] - The URL associated with this note.
   */
  constructor(url = null) {
    /**
     * The cells within this note.
     * @type {NoteCell[]}
     */
    // this.id = id || new Date().toISOString(); The url to cells can be a unique map?
    this.cells = [];
    /**
     * The URL associated with this note.
     * @type {string|null}
     */
    this.url = url;
  }
}

/**
 * Represents a single cell within a note.
 */
export class NoteCell {
  /**
   * Creates a new NoteCell instance.
   *
   * @param {number} timestamp - The unique timestamp for this cell.
   * @param {string} content - The content of this cell.
   * @param {string} cellType - The type of this cell (e.g., 'text', 'code').
   */
  constructor(timestamp, content, cellType) {
    /**
     * The content of the cell.
     * @type {string}
     */
    this.content = content;

    /**
     * The type of the cell (e.g., 'text', 'code').
     * @type {string}
     */
    this.cellType = cellType;

    /**
     * The unique timestamp for this cell.
     * @type {number}
     */
    this.timestamp = timestamp;
  }
}
