import { newapplySyntaxHighlighting } from './SyntaxHighlighter.js';
import { parseMarkdown } from '../markdownRules.js';
import { MarkdownToolBar } from './MarkdownToolBar.js';

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
    const spanText = document.createElement('span');
    spanText.innerHTML = `&lt;/&gt  `;

    // Create cell content
    const cellContent = document.createElement('div');
    cellContent.classList.add('cell-content');

    const textarea = document.createElement('textarea');
    textarea.value = cell.content || '';
    textarea.placeholder = `Write your ${cell.cellType === 'markdown' ? 'text' : 'code'} here...`;

    if (cell.cellType === 'code') {
      // Create wrapper for the code editor components
      const codeEditorWrapper = document.createElement('div');
      codeEditorWrapper.classList.add('code-editor-wrapper');
      // Create container for editor and highlighting
      const editorContainer = document.createElement('div');
      editorContainer.classList.add('editor-container');
      editorContainer.style.position = 'relative';
      // Create syntax highlighting overlay
      const syntaxOverlay = document.createElement('div');
      syntaxOverlay.classList.add('syntax-overlay');
      // Create textarea
      const codeTextarea = document.createElement('textarea');
      codeTextarea.classList.add('code-editor');
      codeTextarea.style.position = 'absolute';
      codeTextarea.style.backgroundColor = 'transparent';
      codeTextarea.style.color = 'transparent';
      codeTextarea.style.caretColor = ' ';
      codeTextarea.style.lineHeight = '1.5';
      codeTextarea.style.outline = 'none';
      codeTextarea.style.overflow = 'auto';
      codeTextarea.placeholder = 'Write your code here...';
      codeTextarea.value = cell.content || '';
      // Function to update syntax highlighting
      const updateSyntaxHighlighting = () => {
        const code = codeTextarea.value;
        //const selectedLanguage = select.value;
        // Apply syntax highlighting
        const highlightedCode = newapplySyntaxHighlighting(code);
        syntaxOverlay.innerHTML = highlightedCode;
        // Sync scroll
        syntaxOverlay.scrollTop = codeTextarea.scrollTop;
        syntaxOverlay.scrollLeft = codeTextarea.scrollLeft;
      };

      // Debounce for syntax highlighting
      let debounceTimeout;
      const debouncedHighlighting = () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(updateSyntaxHighlighting, 10);
      };

      // Event listeners
      let saveTimeout;
      codeTextarea.addEventListener('input', () => {
        debouncedHighlighting();

        // Save functionality
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(
          () => this.onUpdateCell(cell.timestamp, codeTextarea.value, 'code'),
          200,
        );
      });

      // Scroll synchronization
      codeTextarea.addEventListener('scroll', () => {
        syntaxOverlay.scrollTop = codeTextarea.scrollTop;
        syntaxOverlay.scrollLeft = codeTextarea.scrollLeft;
      });

      codeTextarea.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          const cursorPos = codeTextarea.selectionStart;
          const currentLine = codeTextarea.value
            .substring(0, cursorPos)
            .split('\n')
            .pop();

          // Match leading spaces or tabs on the current line
          const indentMatch = currentLine.match(/^\s+/);
          let indent = indentMatch ? indentMatch[0] : '';

          // Add extra indentation if the line ends with a block-starting character
          if (
            currentLine.trim().endsWith(':') ||
            currentLine.trim().endsWith('{')
          ) {
            indent += '    '; // Add four spaces for block-level indent
          }

          // Insert the new line with the calculated indentation
          const newValue =
            codeTextarea.value.substring(0, cursorPos) +
            '\n' +
            indent +
            codeTextarea.value.substring(cursorPos);

          codeTextarea.value = newValue;

          // Move the cursor to the end of the indentation
          codeTextarea.selectionStart = codeTextarea.selectionEnd =
            cursorPos + indent.length + 1;

          event.preventDefault(); // Prevent default Enter key behavior

          // Update syntax highlighting
          updateSyntaxHighlighting();
        }
      });

      // Initial syntax highlighting
      updateSyntaxHighlighting();

      // Compose the editor container
      editorContainer.appendChild(syntaxOverlay);
      editorContainer.appendChild(codeTextarea);

      // Append to the wrapper
      codeEditorWrapper.appendChild(editorContainer);
      cellContent.appendChild(codeEditorWrapper);
    } else {
      // Markdown button
      const markdownBtn = document.createElement('button');
      markdownBtn.classList.add('markdown-btn');
      const markdownText = document.createElement('span');
      markdownText.innerHTML = 'M';
      markdownBtn.appendChild(markdownText);
      const markdownIcon = document.createElement('i');
      markdownIcon.classList.add(
        'fa-solid',
        cell.cellType === 'markdownFormat'
          ? 'fa-markdown-on'
          : 'fa-markdown-off',
      );
      markdownBtn.appendChild(markdownIcon);
      markdownBtn.addEventListener('click', (event) =>
        this.markdownCellType(event),
      );

      let saveTimeout;
      textarea.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(
          () => this.onUpdateCell(cell.timestamp, textarea.value, 'markdown'),
          500,
        );
      });

      let renderedContent;

      // If the cell type is markdownFormat, render it
      if (cell.cellType === 'markdownFormat') {
        renderedContent = document.createElement('div');
        renderedContent.classList.add('rendered-content');
        renderedContent.style.display = 'block';
        renderedContent.innerHTML = parseMarkdown(cell.content);

        textarea.style.display = 'none'; // Hide the original textarea
        markdownIcon.classList.add('fa-markdown-on'); // Ensure correct icon

        cellContent.appendChild(textarea); // Append the textarea once at the beginning
        cellContent.appendChild(renderedContent);

        // Initialize toolbar after textarea
        const toolbar = new MarkdownToolBar(
          cell,
          cellContent,
          this.onUpdateCell,
        );
        const toolbarElement = toolbar.render();
        newCell.appendChild(toolbarElement);

        // Disable toolbar buttons in markdownFormat mode
        const toolbarButtons = newCell.querySelectorAll(
          '.markdown-toolbar-button',
        );
        toolbarButtons.forEach((button) => {
          button.disabled = true;
        });

        newCell.appendChild(markdownBtn);
      } else {
        // This is a normal markdown cell
        textarea.style.display = 'block'; // Ensure textarea is visible
        cellContent.appendChild(textarea); // Append the textarea here if not already appended

        // Initialize toolbar after textarea
        const toolbar = new MarkdownToolBar(
          cell,
          cellContent,
          this.onUpdateCell,
        );
        const toolbarElement = toolbar.render();
        newCell.appendChild(toolbarElement);

        // In normal markdown mode, toolbar buttons are enabled
        const toolbarButtons = newCell.querySelectorAll(
          '.markdown-toolbar-button',
        );
        toolbarButtons.forEach((button) => {
          button.disabled = false;
        });

        newCell.appendChild(markdownBtn);
      }
    }
    // Add the delete button and content to the new cell
    newCell.appendChild(deleteBtn);
    newCell.appendChild(cellContent);

    // Add the new cell to the container
    newCellContainer.appendChild(newCell);

    // Handle 'last-cell' class
    this.updateLastCellClass(newCellContainer);
    this.addNewCellButtons(newCellContainer);

    // Insert the new cell after the next existing notes while displaying
    if (cellContainer == this.container) {
      cellContainer.appendChild(newCellContainer);
    } else {
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

  async markdownCellType(event) {
    const markdownBtn = event.target.closest('.markdown-btn');
    if (!markdownBtn) return;

    const cell = markdownBtn.closest('.cell-container');
    const cellContent = cell.querySelector('.cell-content');
    const textarea = cellContent.querySelector('textarea');
    let renderedContent = cellContent.querySelector('.rendered-content');
    const icon = markdownBtn.querySelector('i');

    if (!renderedContent) {
      renderedContent = document.createElement('div');
      renderedContent.classList.add('rendered-content');
      cellContent.appendChild(renderedContent);
    }

    const toolbar = cell.querySelector('.markdown-toolbar');
    // Turn off markdown
    if (icon.classList.contains('fa-markdown-on')) {
      icon.classList.remove('fa-markdown-on');
      icon.classList.add('fa-markdown-off');
      textarea.style.display = 'block';
      renderedContent.style.display = 'none';
      // Show toolbar
      if (toolbar) {
        toolbar.style.display = 'flex';
      }
      if (this.onUpdateCell) {
        await this.onUpdateCell(
          cell.dataset.timestamp,
          textarea.value,
          icon.classList.contains('fa-markdown-off')
            ? icon.classList.contains('fa-toggle-on')
              ? 'code'
              : 'markdown'
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
      // Hide toolbar
      if (toolbar) {
        toolbar.style.display = 'none';
      }
      if (this.onUpdateCell) {
        await this.onUpdateCell(
          cell.dataset.timestamp,
          textarea.value,
          icon.classList.contains('fa-markdown-off')
            ? icon.classList.contains('fa-toggle-on')
              ? 'code'
              : 'markdown'
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

          // Handle 'last-cell' logic
          this.handleLastCellLogic();
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

  // Function to manage 'last-cell' class
  updateLastCellClass(newCellContainer) {
    // Remove 'last-cell' from any existing cells
    const allCells = document.querySelectorAll('.cell-container');
    allCells.forEach((cell) => cell.classList.remove('last-cell'));

    // Add 'last-cell' to the newly added cell
    newCellContainer.classList.add('last-cell');
  }

  handleLastCellLogic() {
    const allCells = document.querySelectorAll('.cell-container');

    if (allCells.length > 0) {
      // Assign 'last-cell' to the last remaining cell
      const lastCell = allCells[allCells.length - 1];
      allCells.forEach((cell) => cell.classList.remove('last-cell')); // Remove from others
      lastCell.classList.add('last-cell');
    } else {
      // If no cells exist, create a new default cell
      console.log('No cells remaining. Creating a new default cell.');

      const defaultCell = {
        content: '',
        cellType: 'markdown',
        timestamp: new Date().toISOString(),
      };

      // Trigger the add cell logic
      if (this.onAddCell) {
        this.onAddCell(
          defaultCell.timestamp,
          defaultCell.content,
          defaultCell.cellType,
          null, // No target timestamp
        ).then(() => this.addCellAfterCurrent(this.container, defaultCell));
      }
    }
  }
}
