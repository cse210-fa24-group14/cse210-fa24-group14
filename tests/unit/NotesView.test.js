import { NotesView } from '../../src/js/components/NotesView.js'; // Adjust path if needed

describe('NotesView', () => {
  let notesView;
  let container;

  beforeEach(() => {
    // Setup a fresh DOM container before each test
    container = document.createElement('div');
    container.id = 'container';
    document.body.appendChild(container);
    notesView = new NotesView(container);
  });

  afterEach(() => {
    // Cleanup after each test
    document.body.removeChild(container);
  });

  test('should render a default cell when no cells are found in a note', async () => {
    const mockAddCell = jest.fn();

    // Initialize NotesView with the mocked container

    notesView.setOnAddCell(mockAddCell);

    // Pass a note with no cells
    await notesView.render({ cells: [] });

    // Verify the mockAddCell callback is called with correct default cell data
    expect(mockAddCell).toHaveBeenCalledTimes(1);
    expect(mockAddCell).toHaveBeenCalledWith(
      expect.any(String), // A timestamp
      '', // Default content
      'markdown', // Default cell type
      null, // No targetTimestamp
    );
    const renderedCells = document.querySelectorAll('.cell-container');
    expect(renderedCells.length).toBe(1);

    const defaultCellTextarea = renderedCells[0].querySelector('textarea');
    expect(defaultCellTextarea).not.toBeNull();
    expect(defaultCellTextarea.value).toBe('');
  });

  test('should render existing cells', async () => {
    const note = {
      cells: [
        { content: 'Cell 1 content', cellType: 'markdown', timestamp: '123' },
        { content: 'Cell 2 content', cellType: 'code', timestamp: '456' },
      ],
    };
    await notesView.render(note);

    const cellContainers = document.querySelectorAll('.cell-container');
    expect(cellContainers.length).toBe(2);
    expect(cellContainers[0].querySelector('textarea').value).toBe(
      'Cell 1 content',
    );
    expect(cellContainers[1].querySelector('textarea').value).toBe(
      'Cell 2 content',
    );
  });

  test('should call onDeleteCell when delete button is clicked for a specific cell and update DOM', async () => {
    const mockDeleteCallback = jest.fn();
    notesView.setOnDeleteCell(mockDeleteCallback);

    const note = {
      cells: [
        { content: 'Cell 1 content', cellType: 'markdown', timestamp: '007' },
        { content: 'Cell 2 content', cellType: 'code', timestamp: '786' },
      ],
    };

    await notesView.render(note);

    // Locate delete buttons
    const deleteButtons = document.querySelectorAll('.delete-btn');
    expect(deleteButtons.length).toBe(2); // Verify initial state

    // Trigger the delete action on the second cell
    deleteButtons[1].dispatchEvent(new Event('click', { bubbles: true }));

    // Wait for DOM updates
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Ensure callback is triggered with the correct timestamp
    expect(mockDeleteCallback).toHaveBeenCalledTimes(1);
    expect(mockDeleteCallback).toHaveBeenCalledWith('786');

    // Verify DOM state after deletion
    const remainingCells = document.querySelectorAll('.cell-container');
    console.log('Remaining cells:', remainingCells.length); // Debug remaining cells
    expect(remainingCells.length).toBe(1);
    expect(remainingCells[0].dataset.timestamp).toBe('007'); // Ensure only the first cell remains
  });

  test('should toggle cell type between markdown and code', async () => {
    const mockUpdateCallback = jest.fn();
    notesView.setOnUpdateCell(mockUpdateCallback);

    const note = {
      cells: [
        { content: 'Test content', cellType: 'markdown', timestamp: '123' },
      ],
    };

    await notesView.render(note);

    const toggleButton = document.querySelector('.toggle-btn');
    toggleButton.click();

    const icon = toggleButton.querySelector('i');
    expect(icon.classList.contains('fa-toggle-on')).toBeTruthy();
    expect(mockUpdateCallback).toHaveBeenCalledWith(
      '123',
      'Test content',
      'code',
    );
  });

  test('should save content changes after typing', async () => {
    jest.useFakeTimers(); // Enable fake timers
    const mockUpdateCallback = jest.fn();
    notesView.setOnUpdateCell(mockUpdateCallback);

    const note = {
      cells: [{ content: '', cellType: 'markdown', timestamp: '123' }],
    };

    await notesView.render(note);

    const textarea = document.querySelector('textarea');
    textarea.value = 'New content';
    textarea.dispatchEvent(new Event('input'));

    jest.advanceTimersByTime(500); // Simulate debounce delay

    expect(mockUpdateCallback).toHaveBeenCalledWith(
      '123',
      'New content',
      'markdown',
    );
    jest.useRealTimers(); // Restore real timers after the test suite
  });
});
