import { NoteRepository } from '../../src/js/repositories/NoteRepository';
import { StorageService } from '../../src/js/services/StorageService';
import { Note } from '../../src/js/models/Note';

// Mock the StorageService
jest.mock('../../src/js/services/StorageService');

describe('NoteRepository', () => {
  let noteRepository;
  let mockStorageService;
  let consoleSpy;
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a new instance for each test
    noteRepository = new NoteRepository();
    // Get the first instance of StorageService, this is created in NoteRepository constructor
    mockStorageService = StorageService.mock.instances[0];
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('getAllNotes', () => {
    it('should return all notes from storage', async () => {
      const mockNotes = [
        { content: 'Note 1', url: 'url1', timestamp: Date.now() },
        { content: 'Note 2', url: 'url2', timestamp: Date.now() },
      ];

      // This mocks the get method of StorageService
      mockStorageService.get.mockResolvedValue(mockNotes);

      const result = await noteRepository.getAllNotes();

      expect(mockStorageService.get).toHaveBeenCalledWith('notes', []);
      expect(result).toHaveLength(2);
      expect(result[0].content).toBe('Note 1');
      expect(result[1].content).toBe('Note 2');
    });

    it('should return an empty array if no notes are found', async () => {
      mockStorageService.get.mockResolvedValue([]);
      const result = await noteRepository.getAllNotes();
      expect(result).toEqual([]);
    });

    it('should throw an error if the storage service fails', async () => {
      mockStorageService.get.mockRejectedValue(
        new Error('Failed to get notes'),
      );
      await expect(noteRepository.getAllNotes()).rejects.toThrow(
        'Failed to get notes',
      );
    });
  });

  describe('addNote', () => {
    it('should add a new note to storage', async () => {
      const existingNotes = [];
      mockStorageService.get.mockResolvedValue(existingNotes);

      const result = await noteRepository.addNote('Test content', 'test-url');

      expect(mockStorageService.set).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Note);
      expect(result.content).toBe('Test content');
      expect(result.url).toBe('test-url');
    });

    it('should throw an error if the storage service fails', async () => {
      mockStorageService.get.mockResolvedValue([
        { content: 'Note 1', url: 'url1', id: 'id1' },
      ]);
      mockStorageService.set.mockRejectedValue(new Error('Failed to add note'));
      await expect(
        noteRepository.addNote('Test content', 'test-url'),
      ).rejects.toThrow('Failed to add note');
    });
  });

  describe('deleteNote', () => {
    it('should delete a note from storage', async () => {
      const mockNotes = [
        { content: 'Note 1', url: 'url1', id: 'id1' },
        { content: 'Note 2', url: 'url2', id: 'id2' },
      ];

      mockStorageService.get.mockResolvedValue(mockNotes);

      await noteRepository.deleteNote(mockNotes[0].id);

      expect(mockStorageService.set).toHaveBeenCalledWith(
        'notes',
        expect.arrayContaining([
          expect.objectContaining({
            content: 'Note 2',
            url: 'url2',
            id: 'id2',
          }),
        ]),
      );
    });

    it('should throw an error if the storage service fails', async () => {
      mockStorageService.get.mockResolvedValue([
        { content: 'Note 1', url: 'url1', id: 'id1' },
      ]);
      mockStorageService.set.mockRejectedValue(
        new Error('Failed to delete note'),
      );
      await expect(noteRepository.deleteNote('id1')).rejects.toThrow(
        'Failed to delete note',
      );
    });
  });
});
