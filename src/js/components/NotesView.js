import { newapplySyntaxHighlighting, applySyntaxHighlightingWithErrors } from "./SyntaxHighlighter.js";
// This is the main component for the notes list view
export class NotesView {
  constructor(containerElement) {
    this.container = containerElement; // DOM element to render the notes
    this.onDeleteCell = null;
    this.onAddCell = null;
    this.onUpdateCell = null;
    //this.syntaxHighlight = new SyntaxHighlighter()
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

    // if (cell.cellType === 'code') {
    //   // Create wrapper for the code editor components
    //   const codeEditorWrapper = document.createElement('div');
    //   codeEditorWrapper.classList.add('code-editor-wrapper');
      
    //   // Add language selector inside the code box
    //   const selectWrapper = document.createElement('div');
    //   selectWrapper.classList.add('select-wrapper');
      
    //   const label = document.createElement('label');
    //   label.setAttribute('for', 'languages');
    //   label.textContent = 'Select Language: ';
      
    //   const select = document.createElement('select');
    //   select.id = 'languages';
    //   const languages = ['python', 'c', 'cpp', 'java', 'html', 'css', 'js'];
    //   languages.forEach(language => {
    //       const option = document.createElement('option');
    //       option.value = language;
    //       option.textContent = language.charAt(0).toUpperCase() + language.slice(1);
    //       select.appendChild(option);
    //   });
      
    //   selectWrapper.appendChild(label);
    //   selectWrapper.appendChild(select);
    //   codeEditorWrapper.appendChild(selectWrapper);

    //   const selectedLanguage = select.value;
    //   // Create a code-specific textarea for Python
    //   const codeTextarea = document.createElement('textarea');
    //   //const highlightedCodeDiv = document.createElement('div');
    //   //highlightedCodeDiv.contentEditable = true
    //   codeTextarea.classList.add('code-editor');
    //   codeTextarea.placeholder = 'Write your code here...';
    //   codeTextarea.value = cell.content || '';
      
    //   codeTextarea.addEventListener('input', (e) => {

    //     const code = codeTextarea.value;

      
   
    //   let newHighlight = newapplySyntaxHighlighting(code, selectedLanguage)
    //   console.log(newHighlight)
    //   //highlightedCodeDiv.innerHTML = newHighlight

    //    codeTextarea.innerHTML = newHighlight
       
    //    //codeTextarea.insertBefore(highlightedCodeDiv, codeTextarea)

    //     });
    //   // codeTextarea.addEventListener('input', (e) => {
    //   //   const code = codeTextarea.value;

        
    //   //   // Apply syntax highlighting
    //   //   const newHighlight = newapplySyntaxHighlighting(code, selectedLanguage);
        
    //   //   // Remove the existing highlighted code
    //   //   const existingHighlighted = codeEditorWrapper.querySelector('.highlighted-code');
    //   //   if (existingHighlighted) {
    //   //     codeEditorWrapper.removeChild(existingHighlighted);
    //   //   }
        
    //   //   // Create a new div for displaying the highlighted code
    //   //   const highlightedCode = document.createElement('pre');
    //   //   highlightedCode.classList.add('highlighted-code');
    //   //   highlightedCode.innerHTML = newHighlight;
    //   //   //codeEditorWrapper.appendChild(highlightedCode);
    //   //   codeTextarea.appendChild(highlightedCode)
        
    //   //   // Update the code textarea with the highlighted content
    //   //   //codeTextarea.value = code;
    //   // });

    //   // codeTextarea.addEventListener('input', (e) => {
    //   //   const code = codeTextarea.value;
      
    //   //   // Apply syntax highlighting
    //   //   const newHighlight = newapplySyntaxHighlighting(code, selectedLanguage);
      
    //   //   // Remove the existing highlighted code
    //   //   const existingHighlighted = codeEditorWrapper.querySelector('.highlighted-code');
    //   //   if (existingHighlighted) {
    //   //     codeEditorWrapper.removeChild(existingHighlighted);
    //   //   }
      
    //   //   // Create a new div for displaying the highlighted code
    //   //   const highlightedCode = document.createElement('pre');
    //   //   highlightedCode.classList.add('highlighted-code');
    //   //   highlightedCode.innerHTML = newHighlight;
    //   //   codeTextarea.parentNode.insertBefore(highlightedCode, codeTextarea);
      
    //   //   // Update the code textarea with the highlighted content
    //   //   codeTextarea.value = code;
    //   // });

    
    //   select.addEventListener('change', (event) => {
    //       //selectedLanguage = event.target.value;
    //       const code = codeTextarea.value;
    //       highlightedCode.innerHTML = this.applySyntaxHighlightingWithErrors(code, selectedLanguage);
    //   });
    
    //   codeTextarea.addEventListener('scroll', () => {
    //     codeTextarea.scrollTop = codeTextarea.scrollTop;
    //     codeTextarea.scrollLeft = codeTextarea.scrollLeft;
    //   });

    //   codeTextarea.addEventListener('scroll', () => {
    //     const highlightedCode = codeEditorWrapper.querySelector('.highlighted-code');
    //     if (highlightedCode) {
    //         highlightedCode.scrollTop = codeTextarea.scrollTop;
    //         highlightedCode.scrollLeft = codeTextarea.scrollLeft;
    //     }
    //     });
    
     
    //   let debounceTimeout;
    //   // codeTextarea.addEventListener('keydown', () => {
    //   //   clearTimeout(debounceTimeout);

    //   //   debounceTimeout = setTimeout(() => {
    //   //       const code = codeTextarea.value;

    //   //       // Apply syntax highlighting with errors
    //   //       const highlighted = applySyntaxHighlightingWithErrors(code, selectedLanguage);
    //   //       codeTextarea.innerHTML = highlighted;
    //   //       console.log(codeTextarea.innerHTML);
    //   //   }, 1000); // Wait 1s after typing stops
    //   // })

    //   codeTextarea.addEventListener('keydown', () => {
    //     clearTimeout(debounceTimeout);
      
    //     debounceTimeout = setTimeout(() => {
    //       const code = codeTextarea.value;
      
    //       // Create a separate div for displaying highlighted code
    //       const highlightedCode = document.createElement('pre');
    //       highlightedCode.classList.add('highlighted-code');
      
    //       // Apply syntax highlighting with errors
    //       const highlighted = applySyntaxHighlightingWithErrors(code, selectedLanguage);
    //       highlightedCode.innerHTML = highlighted;
      
    //       // Replace the previous highlighted code or append if not exists
    //       const existingHighlighted = codeEditorWrapper.querySelector('.highlighted-code');
    //       if (existingHighlighted) {
    //         existingHighlighted.remove();
    //       }
    //       codeEditorWrapper.appendChild(highlightedCode);
    //     }, 1000); // Wait 1s after typing stops
    //   });
      

    //   codeTextarea.addEventListener('keydown', (event) => {
    //     if (event.key === 'Enter') {
    //         const cursorPos = codeTextarea.selectionStart;
    //         const currentLine = codeTextarea.value.substring(0, cursorPos).split('\n').pop();
        
    //         // Match leading spaces or tabs on the current line
    //         const indentMatch = currentLine.match(/^\s+/);
    //         let indent = indentMatch ? indentMatch[0] : '';
        
    //         // Add extra indentation if the line ends with a block-starting character
    //         if (currentLine.trim().endsWith(':') || currentLine.trim().endsWith('{')) {
    //             indent += '    '; // Add four spaces for block-level indent
    //         }
            
    //         // Insert the new line with the calculated indentation
    //         const newValue = 
    //             codeTextarea.value.substring(0, cursorPos) +
    //             '\n' +
    //             indent +
    //             codeTextarea.value.substring(cursorPos);
                
    //         codeTextarea.value = newValue;
        
    //         // Move the cursor to the end of the indentation
    //         codeTextarea.selectionStart = codeTextarea.selectionEnd = cursorPos + indent.length + 1;
        
    //         event.preventDefault(); // Prevent default Enter key behavior
    //     }
    // });

  
      
    //   let saveTimeout;
    //   codeTextarea.addEventListener('input', () => {
    //     clearTimeout(saveTimeout);
    //     saveTimeout = setTimeout(
    //       () => this.onUpdateCell(cell.timestamp, codeTextarea.value, 'code'),
    //       500
    //     );
    //   });
    //   codeEditorWrapper.appendChild(codeTextarea)
    //   cellContent.appendChild(codeEditorWrapper);
      
    // } 
    if (cell.cellType === 'code') {
      // Create wrapper for the code editor components
      const codeEditorWrapper = document.createElement('div');
      codeEditorWrapper.classList.add('code-editor-wrapper');
      
      // Create language selector
      const selectWrapper = document.createElement('div');
      selectWrapper.classList.add('select-wrapper');
      
      const label = document.createElement('label');
      label.setAttribute('for', 'languages');
      label.textContent = 'Select Language: ';
      
      const select = document.createElement('select');
      select.id = 'languages';
      const languages = ['python', 'c', 'cpp', 'java', 'html', 'css', 'js'];
      languages.forEach(language => {
        const option = document.createElement('option');
        option.value = language;
        option.textContent = language.charAt(0).toUpperCase() + language.slice(1);
        select.appendChild(option);
      });
      
      selectWrapper.appendChild(label);
      selectWrapper.appendChild(select);
      codeEditorWrapper.appendChild(selectWrapper);
    
      // Create container for editor and highlighting
      const editorContainer = document.createElement('div');
      editorContainer.classList.add('editor-container');
      editorContainer.style.position = 'relative';
    
      // Create syntax highlighting overlay
      const syntaxOverlay = document.createElement('div');
      syntaxOverlay.classList.add('syntax-overlay');
      syntaxOverlay.style.position = 'absolute';
      syntaxOverlay.style.top = '0';
      syntaxOverlay.style.left = '0';
      syntaxOverlay.style.width = '100%';
      syntaxOverlay.style.height = '100%';
      syntaxOverlay.style.pointerEvents = 'none';
      syntaxOverlay.style.overflow = 'auto';
      syntaxOverlay.style.borderRadius = '4px';
      syntaxOverlay.style.fontFamily = 'monospace';
      syntaxOverlay.style.fontSize = '1rem';
      syntaxOverlay.style.lineHeight = '1.5';
      syntaxOverlay.style.padding = '10px';
      syntaxOverlay.style.whiteSpace = 'pre-wrap';
    
      // Create textarea
      const codeTextarea = document.createElement('textarea');
      codeTextarea.classList.add('code-editor');
      codeTextarea.style.position = 'absolute';
      codeTextarea.style.top = '0';
      codeTextarea.style.left = '0';
      codeTextarea.style.width = '100%';
      codeTextarea.style.height = '100%';
      codeTextarea.style.backgroundColor = 'transparent';
      codeTextarea.style.color = 'transparent';
      codeTextarea.style.caretColor = 'black';
      codeTextarea.style.resize = 'none';
      codeTextarea.style.border = '1px solid #ccc';
      codeTextarea.style.borderRadius = '4px';
      codeTextarea.style.fontFamily = 'monospace';
      codeTextarea.style.fontSize = '1rem';
      codeTextarea.style.lineHeight = '1.5';
      codeTextarea.style.padding = '10px';
      codeTextarea.style.outline = 'none';
      codeTextarea.style.overflow = 'auto';
    
      codeTextarea.placeholder = 'Write your code here...';
      codeTextarea.value = cell.content || '';
    
      // Function to update syntax highlighting
      const updateSyntaxHighlighting = () => {
        const code = codeTextarea.value;
        const selectedLanguage = select.value;
    
        // Apply syntax highlighting
        const highlightedCode = newapplySyntaxHighlighting(code, selectedLanguage);
        syntaxOverlay.innerHTML = highlightedCode;
    
        // Sync scroll
        syntaxOverlay.scrollTop = codeTextarea.scrollTop;
        syntaxOverlay.scrollLeft = codeTextarea.scrollLeft;
      };
    
      // Debounce for syntax highlighting
      let debounceTimeout;
      const debouncedHighlighting = () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(updateSyntaxHighlighting, 300);
      };
    
      // Event listeners
      let saveTimeout
      codeTextarea.addEventListener('input', () => {
        debouncedHighlighting();
        
        // Save functionality
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(
          () => this.onUpdateCell(cell.timestamp, codeTextarea.value, 'code'),
          200
        );
      });
    
      // Scroll synchronization
      codeTextarea.addEventListener('scroll', () => {
        syntaxOverlay.scrollTop = codeTextarea.scrollTop;
        syntaxOverlay.scrollLeft = codeTextarea.scrollLeft;
      });
    
      // Language change listener
      select.addEventListener('change', () => {
        updateSyntaxHighlighting();
      });
    
      // Smart indentation on Enter key
      codeTextarea.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          const cursorPos = codeTextarea.selectionStart;
          const currentLine = codeTextarea.value.substring(0, cursorPos).split('\n').pop();
      
          // Match leading spaces or tabs on the current line
          const indentMatch = currentLine.match(/^\s+/);
          let indent = indentMatch ? indentMatch[0] : '';
      
          // Add extra indentation if the line ends with a block-starting character
          if (currentLine.trim().endsWith(':') || currentLine.trim().endsWith('{')) {
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
          codeTextarea.selectionStart = codeTextarea.selectionEnd = cursorPos + indent.length + 1;
      
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
    }
    else {
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
        icon.classList.contains('fa-toggle-off') ? 'markdown' : 'code'
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
