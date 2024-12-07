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
        this.addCellAfterCurrent(this.container, cell);
      }
    });
  }

  async addCellAfterCurrent(cellContainer, cell) {
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

    toggleBtn.addEventListener('click', (event) => this.toggleCellType(event));

    // Create cell content
    const cellContent = document.createElement('div');
    cellContent.classList.add('cell-content');

    if (cell.cellType === 'code') {
      // Create a code-specific textarea for Python
      const codeTextarea = document.createElement('textarea');
      codeTextarea.classList.add('code-editor');
      codeTextarea.placeholder = 'Write your code here...';
      codeTextarea.value = cell.content || '';
      
      // Add syntax highlighting
      codeTextarea.addEventListener('input', (e) => {
        this.highlightPythonSyntax(codeTextarea);
      });
  
      // Save changes with debounce
      let saveTimeout;
      codeTextarea.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(
          () => this.onUpdateCell(cell.timestamp, codeTextarea.value, 'code'),
          500
        );
      });
  
      cellContent.appendChild(codeTextarea);
    } else {
      // Keep existing markdown textarea logic
      const textarea = document.createElement('textarea');
      textarea.value = cell.content || '';
      textarea.placeholder = 'Write your text here...';
      
      let saveTimeout;
      textarea.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(
          () => this.onUpdateCell(cell.timestamp, textarea.value, 'markdown'),
          500
        );
      });
  
      cellContent.appendChild(textarea);
    }

    // Add the delete button, toggle button, and content to the new cell
    newCell.appendChild(deleteBtn);
    newCell.appendChild(toggleBtn);
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

  // Add a method for basic Python syntax highlighting
highlightPythonSyntax(textarea) {
  // Simple, basic syntax highlighting
  const keywords = [
    'def', 'class', 'import', 'from', 'as', 'in', 'is', 'and', 'or', 'not', 
    'if', 'else', 'elif', 'for', 'while', 'return', 'yield', 'break', 
    'continue', 'pass', 'try', 'except', 'finally', 'with', 'lambda'
  ];

  let value = textarea.value;
  
  // Basic keyword highlighting
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
    value = value.replace(regex, `<span style="color: blue;">${keyword}</span>`);
  });

  // Basic string highlighting
  value = value.replace(
    /(".*?"|'.*?')/g, 
    '<span style="color: green;">$1</span>'
  );

  // Basic comment highlighting
  value = value.replace(
    /(#.*)/g, 
    '<span style="color: gray;">$1</span>'
  );

  // Create a pre element to show highlighted code
  const highlightedCode = document.createElement('pre');
  highlightedCode.innerHTML = value;
  highlightedCode.style.fontFamily = 'monospace';
  highlightedCode.style.backgroundColor = '#f4f4f4';
  highlightedCode.style.padding = '10px';
  highlightedCode.style.overflowX = 'auto';

  // Replace textarea with highlighted code (optional)
  // In a more advanced implementation, you might want to keep the textarea 
  // and overlay the highlighting
  textarea.parentNode.replaceChild(highlightedCode, textarea);
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
    if (this.onUpdateCell) {
      await this.onUpdateCell(
        cell.dataset.timestamp,
        cellContent.value,
        icon.classList.contains('fa-toggle-off') ? 'markdown' : 'code',
      );
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
