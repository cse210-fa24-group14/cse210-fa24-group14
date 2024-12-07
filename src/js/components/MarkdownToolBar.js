export class MarkdownToolBar {
    constructor(cell, cellContainer, onUpdateCell) {
      this.cellContainer = cellContainer;
      this.textArea = cellContainer.querySelector('textarea');
      this.onUpdateCell = onUpdateCell;
      this.toolbar = document.createElement('div');
      this.toolbar.classList.add('markdown-toolbar'); // Style using CSS
      this.cell = cell;
  
      // Predefined button configurations
      this.buttons = [
        { id: 'bold-btn', label: 'B', prefix: '**', suffix: '**', tooltip: 'Bold' },
        { id: 'italic-btn', label: 'I', prefix: '*', suffix: '*', tooltip: 'Italic' },
        { id: 'underline-btn', label: 'U', prefix: '<u>', suffix: '</u>', tooltip: 'Underline' },
        { id: 'strikethrough-btn', label: 'S', prefix: '~~', suffix: '~~', tooltip: 'Strikethrough' },
        { id: 'unordered-list-btn', label: '-', prefix: '- ', suffix: '', tooltip: 'Unordered List' },
        { id: 'heading1-btn', label: 'H1', prefix: '# ', suffix: '', tooltip: 'Heading 1' },
        { id: 'heading2-btn', label: 'H2', prefix: '## ', suffix: '', tooltip: 'Heading 2' },
        { id: 'code-btn', label: '>_', prefix: '`', suffix: '`', tooltip: 'Inline Code' },
      ];
    }
  
    render() {
      this.buttons.forEach((buttonConfig) => {
        const button = this.createButton(buttonConfig);
        this.toolbar.appendChild(button);
      });
  
      return this.toolbar;
    }
  
    createButton({ id, label, prefix, suffix, tooltip }) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.id = id;
      button.title = tooltip;
      button.classList.add('markdown-toolbar-button');
  
      button.addEventListener('click', () => this.insertMarkdown(prefix, suffix));
  
      return button;
    }
  
    insertMarkdown(prefix, suffix) {
  if (!this.textArea) {
    console.error('Textarea not found in the cell container.');
    return;
  }

  const start = this.textArea.selectionStart;
  const end = this.textArea.selectionEnd;
  const text = this.textArea.value;

  // Add the Markdown syntax around the selected text
  const selectedText = text.slice(start, end);
  const newText =
    text.slice(0, start) + prefix + selectedText + suffix + text.slice(end);

  this.textArea.value = newText;

  // Calculate the new cursor position
  const cursorPosition = start + prefix.length + selectedText.length;

  // Set focus back to the textarea and move the cursor
  this.textArea.focus();
  this.textArea.setSelectionRange(cursorPosition, cursorPosition);
  
      // Update the cell content
      if (this.onUpdateCell) {
        const timestamp = this.cell.timestamp;
        this.onUpdateCell(timestamp, this.textArea.value, 'markdown');
      }
    }
  }