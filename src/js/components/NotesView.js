import { parseMarkdown } from '../utils.js';

// This is the main component for the notes list view
export class NotesView {
  constructor(containerElement) {
    this.container = containerElement; // DOM element to render the notes
    this.onDeleteCell = null;
    this.onAddCell = null;
    this.onUpdateCell = null;
  }

  // This is to set the callback for when a note is deleted in NoteListView
  setOnDeleteCell(callback) {
    this.onDeleteCell = callback;
  }

  setOnAddCell(callback) {
    this.onAddCell = callback;
  }

  setOnUpdateCell(callback) {
    this.onUpdateCell = callback;
  }

  async render(note) {
    // Ensure that the container is only cleared when necessary
    // Only clear if there are no cells to render or the note has changed
    if (!note || !note.cells || note.cells.length === 0) {
      console.log('No cells found, adding a new one');
      // Create a new default cell
      const defaultCell = {
        content: '',
        cellType: 'markdown',
        timestamp: new Date().toISOString(),
      };
      if (this.onAddCell) {
        await this.onAddCell(
          defaultCell.timestamp,
          defaultCell.content,
          defaultCell.cellType,
          null,
        ); //targetTimestamp empty for a default cell
      }

      this.addCellAfterCurrent(this.container, defaultCell);
      return;
    }

    const renderedTimestamps = Array.from(
      this.container.querySelectorAll('.cell-container'),
    ).map((cell) => cell.getAttribute('data-timestamp'));

    // Render each cell that isn't already rendered
    note.cells.forEach((cell) => {
      if (!renderedTimestamps.includes(cell.timestamp.toString())) {
        console.log('Rendering new cell', cell);
        this.addCellAfterCurrent(this.container, cell, note);
      }
    });
  }

  async addCellAfterCurrent(cellContainer, cell, note) {
    const newCellContainer = document.createElement('div');
    newCellContainer.classList.add('cell-container');
    newCellContainer.dataset.timestamp = cell.timestamp; // Add timestamp for tracking

    // Create the cell
    const newCell = document.createElement('div');
    newCell.classList.add('cell');

    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    const deleteIcon = document.createElement('i');
    deleteIcon.classList.add('fa-regular', 'fa-trash-can');
    deleteBtn.appendChild(deleteIcon);

    // Add event listener for deletion
    deleteBtn.addEventListener('click', (event) => this.deleteCell(event));

    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.classList.add('toggle-btn');
    const spanText = document.createElement('span');
    spanText.innerHTML = `&lt;/&gt  `;
    toggleBtn.appendChild(spanText);

    const toggleIcon = document.createElement('i');
    toggleIcon.classList.add(
      'fa-solid',
      cell.cellType === 'markdown' ? 'fa-toggle-off' : 'fa-toggle-on',
    );
    toggleBtn.appendChild(toggleIcon);

    toggleBtn.addEventListener('click', (event) =>
      this.toggleCellType(event, note),
    );

    // Markdown button
    const markdownBtn = document.createElement('button');
    markdownBtn.classList.add('markdown-btn');
    const markdownText = document.createElement('span');
    markdownText.innerHTML = 'M';
    markdownBtn.appendChild(markdownText);
    const markdownIcon = document.createElement('i');
    markdownIcon.classList.add(
      'fa-solid',
      cell.cellType === 'markdownFormat' ? 'fa-markdown-on' : 'fa-markdown-off',
    );
    markdownBtn.appendChild(markdownIcon);
    markdownBtn.addEventListener('click', (event) =>
      this.markdownCellType(event),
    );

    toggleBtn.disabled = cell.cellType === 'markdownFormat'; // Disable if markdownFormat
    markdownBtn.disabled = cell.cellType === 'code'; // Disable if code

    // Create cell content
    const cellContent = document.createElement('div');
    cellContent.classList.add('cell-content');

    const textarea = document.createElement('textarea');
    textarea.value = cell.content || '';
    textarea.placeholder = `Write your ${cell.cellType === 'markdown' ? 'text' : 'code'} here...`;

    // Add listener to save changes to the database
    let saveTimeout;
    textarea.addEventListener('input', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        this.onUpdateCell(cell.timestamp, textarea.value, cell.cellType);
      }, 500);
    });

    cellContent.appendChild(textarea);

    // Add the delete button, toggle button, and content to the new cell
    newCell.appendChild(deleteBtn);
    newCell.appendChild(toggleBtn);
    newCell.appendChild(markdownBtn);
    newCell.appendChild(cellContent);

    // Add the new cell to the container
    newCellContainer.appendChild(newCell);
    this.addNewCellButtons(newCellContainer);

    // Insert the new cell after the next existing notes while displaying
    if (cellContainer == this.container) {
      cellContainer.appendChild(newCellContainer);
    } else {
      //if called from "+ Markdown" or "+ Code" buttons, then insert before the next nodes or in between
      const parentElement = cellContainer.parentNode;
      const nextSibling = cellContainer.nextSibling; // Get the next sibling node
      parentElement.insertBefore(newCellContainer, nextSibling); // Insert the new cell before the next sibling
    }
  }

  addNewCellButtons(container) {
    const addNewButtons = document.createElement('div');
    addNewButtons.classList.add('add-new-buttons');
    const timestamp = container.dataset.timestamp; // Assume timestamp is stored in a `data-timestamp` attribute.
    const addMarkdownButton = document.createElement('button');
    addMarkdownButton.classList.add('new-cell-buttons', 'markdown');
    addMarkdownButton.textContent = '+ Markdown';
    addMarkdownButton.addEventListener('click', async () => {
      const markCell = {
        content: '',
        cellType: 'markdown',
        timestamp: new Date().toISOString(),
      };
      if (this.onAddCell) {
        await this.onAddCell(
          markCell.timestamp,
          markCell.content,
          markCell.cellType,
          timestamp,
        );
      }
      await this.addCellAfterCurrent(container, markCell);
    });

    const addCodeButton = document.createElement('button');
    addCodeButton.classList.add('new-cell-buttons', 'code');
    addCodeButton.textContent = '+ Code';
    addCodeButton.addEventListener('click', async () => {
      const codeCell = {
        content: '',
        cellType: 'code',
        timestamp: new Date().toISOString(),
      };
      if (this.onAddCell) {
        await this.onAddCell(
          codeCell.timestamp,
          codeCell.content,
          codeCell.cellType,
          timestamp,
        );
      }
      await this.addCellAfterCurrent(container, codeCell);
    });

    const hr = document.createElement('hr');

    // Append buttons and hr to the new add cell buttons div
    addNewButtons.appendChild(addMarkdownButton);
    addNewButtons.appendChild(addCodeButton);
    addNewButtons.appendChild(hr);

    container.appendChild(addNewButtons);
  }

  async toggleCellType(event) {
    const toggleBtn = event.target.closest('.toggle-btn');
    if (!toggleBtn) return;

    const cell = toggleBtn.closest('.cell-container');
    const markdownBtn = cell.querySelector('.markdown-btn');
    const cellContent = cell.querySelector('.cell-content textarea');
    const icon = toggleBtn.querySelector('i');

    if (icon.classList.contains('fa-toggle-off')) {
      icon.classList.remove('fa-toggle-off');
      icon.classList.add('fa-toggle-on');
      cellContent.placeholder = 'Write your code here...';
    } else {
      icon.classList.remove('fa-toggle-on');
      icon.classList.add('fa-toggle-off');
      cellContent.placeholder = 'Write your text here...';
    }
    console.log(cell.dataset.timestamp);
    markdownBtn.disabled = icon.classList.contains('fa-toggle-on');

    if (this.onUpdateCell) {
      await this.onUpdateCell(
        cell.dataset.timestamp,
        cellContent.value,
        icon.classList.contains('fa-markdown-on')
          ? 'markdownFormat'
          : icon.classList.contains('fa-toggle-off')
            ? 'markdown'
            : 'code',
      );
    }
  }

  async markdownCellType(event) {
    const markdownBtn = event.target.closest('.markdown-btn');
    if (!markdownBtn) return;

    const cell = markdownBtn.closest('.cell-container');
    const toggleBtn = cell.querySelector('.toggle-btn');
    const cellContent = cell.querySelector('.cell-content');
    const textarea = cellContent.querySelector('textarea');
    let renderedContent = cellContent.querySelector('.rendered-content');
    const icon = markdownBtn.querySelector('i');

    if (!renderedContent) {
      renderedContent = document.createElement('div');
      renderedContent.classList.add('rendered-content');
      cellContent.appendChild(renderedContent);
    }

    // Turn off markdown
    if (icon.classList.contains('fa-markdown-on')) {
      icon.classList.remove('fa-markdown-on');
      icon.classList.add('fa-markdown-off');
      textarea.style.display = 'block';
      renderedContent.style.display = 'none';
      toggleBtn.disabled = false;
      if (this.onUpdateCell) {
        // Ensure callback passes the correct type
        await this.onUpdateCell(
          cell.dataset.timestamp,
          textarea.value,
          icon.classList.contains('fa-markdown-off')
            ? icon.classList.contains('fa-toggle-off')
              ? 'markdown'
              : 'code'
            : 'markdownFormat',
        );
      }
    }

    // Turn on markdown
    else {
      icon.classList.remove('fa-markdown-off');
      icon.classList.add('fa-markdown-on');
      textarea.style.display = 'none';
      renderedContent.style.display = 'block';
      renderedContent.innerHTML = parseMarkdown(textarea.value);
      toggleBtn.disabled = true;
      if (this.onUpdateCell) {
        // Ensure callback passes the correct type
        await this.onUpdateCell(
          cell.dataset.timestamp,
          textarea.value,
          icon.classList.contains('fa-markdown-off')
            ? icon.classList.contains('fa-toggle-off')
              ? 'markdown'
              : 'code'
            : 'markdownFormat',
        );
      }
    }
  }

  async deleteCell(event) {
    const deleteBtn = event.target.closest('.delete-btn');
    if (!deleteBtn) {
      return;
    }

    const cellContainer = deleteBtn.closest('.cell-container');
    const timestamp = cellContainer.dataset.timestamp; // Assume timestamp is stored in a `data-timestamp` attribute.
    if (this.onDeleteCell) {
      try {
        // Await the deletion from the database
        await this.onDeleteCell(timestamp);

        // If successful, remove the DOM node
        if (cellContainer) {
          const parentElement = cellContainer.parentElement;
          parentElement.removeChild(cellContainer);
        }
        // Check if there are any remaining cells
        const remainingCells =
          this.container.querySelectorAll('.cell-container');
        if (remainingCells.length === 0) {
          console.log('No cells remaining, creating a default cell.');
        }
      } catch (error) {
        console.error('Failed to delete cell:', error);
      }
    }
  }
}
