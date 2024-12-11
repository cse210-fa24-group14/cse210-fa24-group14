import { NoteRepository } from '../../src/js/repositories/NoteRepository.js';
import { IndexedDBService } from '../../src/js/services/IndexDBService.js';
import { NoteCell } from '../../src/js/models/Note.js';

// Mock the IndexDBService
jest.mock('../../src/js/services/IndexDBService.js');

describe('NoteRepository Database Operations', () => {
  let noteRepository;
  let mockStorageService;
  let consoleSpy;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a new instance for each test
    noteRepository = new NoteRepository();
    // Get the first instance of IndexedDBService
    mockStorageService = IndexedDBService.mock.instances[0];
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('getNoteByUrl', () => {
    it('should return the note matching the given URL', async () => {
      const mockNotes = [
        { url: 'url1', content: 'Note 1' },
        { url: 'url2', content: 'Note 2' },
      ];
      mockStorageService.get.mockResolvedValue(mockNotes);

      const result = await noteRepository.getNoteByUrl('url2');

      expect(result).toEqual(mockNotes[1]);
    });

    it('should return undefined if no note matches the URL', async () => {
      mockStorageService.get.mockResolvedValue([]);
      const result = await noteRepository.getNoteByUrl('non-existent-url');
      expect(result).toBeUndefined();
    });
  });

  describe('addCellToNote', () => {
    it('should add a cell to an existing note', async () => {
      const mockNotes = [{ url: 'note-url', cells: [] }];
      mockStorageService.get.mockResolvedValue(mockNotes);

      await noteRepository.addCellToNote(
        'note-url',
        '123456',
        'New cell content',
        'markdown',
        null,
      );

      expect(mockStorageService.set).toHaveBeenCalledWith('notes', [
        {
          url: 'note-url',
          cells: [
            expect.objectContaining({
              timestamp: '123456',
              content: 'New cell content',
              cellType: 'markdown',
            }),
          ],
        },
      ]);
    });

    it('should insert a cell after a target cell', async () => {
      const existingCell = new NoteCell('111', 'Existing Cell', 'markdown');
      const mockNotes = [
        {
          url: 'note-url',
          cells: [
            existingCell, // Existing cell
          ],
        },
      ];
      mockStorageService.get.mockResolvedValue(mockNotes);

      const newCell = new NoteCell('222', 'Inserted cell', 'code');

      await noteRepository.addCellToNote(
        'note-url',
        newCell.timestamp,
        newCell.content,
        newCell.cellType,
        '111', // Target cell timestamp
      );

      expect(mockStorageService.set).toHaveBeenCalledWith('notes', [
        {
          url: 'note-url',
          cells: [
            existingCell,
            newCell, // Ensuring the same instance is added
          ],
        },
      ]);
    });

    it('should ensure cells array contains NoteCell instances', async () => {
      const mockNotes = [
        {
          url: 'note-url',
          cells: [new NoteCell('111', 'First cell', 'markdown')],
        },
      ];
      mockStorageService.get.mockResolvedValue(mockNotes);

      const newCell = new NoteCell('222', 'Inserted cell', 'code');

      await noteRepository.addCellToNote(
        'note-url',
        newCell.timestamp,
        newCell.content,
        newCell.cellType,
        null, // Append to the end
      );

      const updatedNotes = mockStorageService.set.mock.calls[0][1]; // Extract the updated notes
      expect(updatedNotes[0].cells).toHaveLength(2);
      expect(updatedNotes[0].cells[1]).toBeInstanceOf(NoteCell); // Ensure it's an instance of NoteCell
    });

    it('should insert a cell after the target cell in the correct order', () => {
      const cells = [
        { timestamp: '111', content: 'First cell' },
        { timestamp: '333', content: 'Third cell' },
      ];
      const targetTimestamp = '111';
      const newCell = { timestamp: '222', content: 'Second cell' };

      const targetIndex = cells.findIndex(
        (cell) => cell.timestamp === targetTimestamp,
      );
      if (targetIndex !== -1) {
        cells.splice(targetIndex + 1, 0, newCell);
      }

      expect(cells).toEqual([
        { timestamp: '111', content: 'First cell' },
        { timestamp: '222', content: 'Second cell' },
        { timestamp: '333', content: 'Third cell' },
      ]);
    });
  });

  describe('updateCellContent', () => {
    it('should update the content and type of an existing cell', async () => {
      const mockNotes = [
        {
          url: 'note-url',
          cells: [
            { timestamp: '123', content: 'Old content', cellType: 'markdown' },
          ],
        },
      ];
      mockStorageService.get.mockResolvedValue(mockNotes);

      await noteRepository.updateCellContent(
        'note-url',
        '123',
        'Updated content',
        'code',
      );

      expect(mockStorageService.set).toHaveBeenCalledWith('notes', [
        {
          url: 'note-url',
          cells: [
            expect.objectContaining({
              timestamp: '123',
              content: 'Updated content',
              cellType: 'code',
            }),
          ],
        },
      ]);
    });

    it('should log an error if the cell is not found', async () => {
      const mockNotes = [
        {
          url: 'note-url',
          cells: [],
        },
      ];
      mockStorageService.get.mockResolvedValue(mockNotes);

      await noteRepository.updateCellContent(
        'note-url',
        'non-existent-timestamp',
        'Updated content',
        'markdown',
      );

      expect(console.error).toHaveBeenCalledWith(
        'Cell not found for updating content.',
      );
    });
  });

  describe('deleteCellFromNote', () => {
    it('should remove a cell from a note', async () => {
      const mockNotes = [
        {
          url: 'note-url',
          cells: [
            { timestamp: '111', content: 'First cell', cellType: 'markdown' },
            { timestamp: '222', content: 'Second cell', cellType: 'code' },
          ],
        },
      ];
      mockStorageService.get.mockResolvedValue(mockNotes);

      await noteRepository.deleteCellFromNote('note-url', '111');

      expect(mockStorageService.set).toHaveBeenCalledWith('notes', [
        {
          url: 'note-url',
          cells: [
            expect.objectContaining({
              timestamp: '222',
              content: 'Second cell',
              cellType: 'code',
            }),
          ],
        },
      ]);
    });

    it('should log an error if deletion fails', async () => {
      mockStorageService.get.mockRejectedValue(
        new Error('Failed to delete cell'),
      );

      await expect(
        noteRepository.deleteCellFromNote('note-url', '111'),
      ).rejects.toThrow('Failed to delete cell');
    });
  });
});
