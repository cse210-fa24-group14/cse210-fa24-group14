/**
 * Class representing a toolbar for editing Markdown content.
 */
export class MarkdownToolBar {
  /**
   * Constructs a MarkdownToolBar instance.
   * 
   * @param {Object} cell - The note cell object.
   * @param {HTMLElement} cellContainer - The container element of the cell.
   * @param {Function} onUpdateCell - Callback to handle updates to the cell content.
   */
  constructor(cell, cellContainer, onUpdateCell) {
    /**
     * The container element of the cell.
     * @type {HTMLElement}
     */
    this.cellContainer = cellContainer;

    /**
     * The textarea element within the cell container for content editing.
     * @type {HTMLTextAreaElement|null}
     */
    this.textArea = cellContainer.querySelector('textarea');

    /**
     * Callback to handle cell updates.
     * @type {Function}
     */
    this.onUpdateCell = onUpdateCell;

    /**
     * The toolbar element for Markdown controls.
     * @type {HTMLDivElement}
     */
    this.toolbar = document.createElement('div');
    this.toolbar.classList.add('markdown-toolbar'); // Style using CSS

    /**
     * The note cell object.
     * @type {Object}
     */
    this.cell = cell;

    /**
     * Predefined configurations for toolbar buttons and dropdowns.
     * @type {Array<Object>}
     */
    this.buttons = [
      {
        id: 'heading-dropdown',
        tooltip: 'Headings',
        dropdown: [
          { prefix: '# ', suffix: '', label: 'H1' },
          { prefix: '## ', suffix: '', label: 'H2' },
          { prefix: '### ', suffix: '', label: 'H3' },
          { prefix: '#### ', suffix: '', label: 'H4' },
          { prefix: '##### ', suffix: '', label: 'H5' },
          { prefix: '###### ', suffix: '', label: 'H6' },
        ],
        icon: 'fa-solid fa-heading',
      },
      {
        id: 'bold-btn',
        prefix: '**',
        suffix: '**',
        tooltip: 'Bold',
        icon: 'fa-solid fa-bold',
      },
      {
        id: 'italic-btn',
        prefix: '*',
        suffix: '*',
        tooltip: 'Italics',
        icon: 'fa-solid fa-italic',
      },
      {
        id: 'underline-btn',
        prefix: '<u>',
        suffix: '</u>',
        tooltip: 'Underline',
        icon: 'fa-solid fa-underline',
      },
      {
        id: 'strikethrough-btn',
        prefix: '~~',
        suffix: '~~',
        tooltip: 'Strikethrough',
        icon: 'fa-solid fa-strikethrough',
      },
      {
        id: 'unordered-list-btn',
        prefix: '- ',
        suffix: '',
        tooltip: 'List',
        icon: 'fa-solid fa-list',
      },
      {
        id: 'code-btn',
        prefix: '```',
        suffix: '```',
        tooltip: 'Code Snippet',
        icon: 'fa-solid fa-code',
      },
      {
        id: 'hr-btn',
        prefix: '',
        suffix: '\n---',
        tooltip: 'Horizontal Rule',
        icon: 'fa-solid fa-minus',
      },
      {
        id: 'link-btn',
        prefix: '[',
        suffix: '](url)',
        tooltip: 'Link',
        icon: 'fa-solid fa-link',
      },
    ];
  }

  /**
   * Renders the Markdown toolbar.
   * 
   * @returns {HTMLDivElement} The rendered toolbar element.
   */
  render() {
    this.buttons.forEach((buttonConfig) => {
      if (buttonConfig.dropdown) {
        const dropdown = this.createDropdown(buttonConfig);
        this.toolbar.appendChild(dropdown);
      } else {
        const button = this.createButton(buttonConfig);
        this.toolbar.appendChild(button);
      }
    });

    return this.toolbar;
  }

  /**
   * Creates a button for the toolbar.
   * 
   * @param {Object} config - Configuration for the button.
   * @param {string} config.id - Button ID.
   * @param {string} config.prefix - Markdown prefix to insert.
   * @param {string} config.suffix - Markdown suffix to insert.
   * @param {string} config.tooltip - Tooltip text.
   * @param {string} config.icon - Font Awesome icon class.
   * @returns {HTMLButtonElement} The created button element.
   */
  createButton({ id, prefix, suffix, tooltip, icon }) {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = id;
    button.title = tooltip;
    button.classList.add('markdown-toolbar-button');
    const buttonIcon = document.createElement('i');
    buttonIcon.classList.add(...icon.split(' '));
    button.appendChild(buttonIcon);

    button.addEventListener('click', () => {
      this.insertMarkdown(prefix, suffix);
    });

    return button;
  }

  /**
   * Creates a dropdown menu for the toolbar.
   * 
   * @param {Object} config - Configuration for the dropdown.
   * @param {string} config.id - Dropdown ID.
   * @param {string} config.tooltip - Tooltip text.
   * @param {Array<Object>} config.dropdown - Dropdown items.
   * @param {string} config.icon - Font Awesome icon class.
   * @returns {HTMLDivElement} The created dropdown element.
   */
  createDropdown({ id, tooltip, dropdown, icon }) {
    const container = document.createElement('div');
    container.id = id;
    container.classList.add('markdown-toolbar-dropdown');
    container.title = tooltip;

    const dropdownButton = document.createElement('button');
    dropdownButton.type = 'button';
    dropdownButton.classList.add('markdown-toolbar-button');
    const dropdownIcon = document.createElement('i');
    dropdownIcon.classList.add(...icon.split(' '));
    dropdownButton.appendChild(dropdownIcon);
    container.appendChild(dropdownButton);

    const dropdownMenu = document.createElement('div');
    dropdownMenu.classList.add('dropdown-menu');

    dropdown.forEach(({ prefix, suffix, label }) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.classList.add('dropdown-item');
      item.textContent = label;
      item.addEventListener('click', () => {
        this.insertMarkdown(prefix, suffix);
      });
      dropdownMenu.appendChild(item);
    });

    container.appendChild(dropdownMenu);
    return container;
  }

  /**
   * Inserts Markdown syntax into the textarea.
   * 
   * @param {string} prefix - The Markdown prefix.
   * @param {string} suffix - The Markdown suffix.
   */
  insertMarkdown(prefix, suffix) {
    if (!this.textArea) {
      console.error('Textarea not found in the cell container.');
      return;
    }

    // Save the current scroll position of the textarea
    const scrollTop = this.textArea.scrollTop;

    const start = this.textArea.selectionStart;
    const end = this.textArea.selectionEnd;
    const text = this.textArea.value;

    const selectedText = text.slice(start, end);

    // Special handling for unordered lists
    if (prefix === '- ') {
      const lines = selectedText.split('\n');
      const allLinesAreBullets = lines.every((line) => line.startsWith('- '));
      const newText = lines
        .map((line) => (allLinesAreBullets ? line.slice(2) : `- ${line}`))
        .join('\n');

      this.textArea.value = text.slice(0, start) + newText + text.slice(end);

      const cursorPosition = start + newText.length;
      this.textArea.focus();
      this.textArea.setSelectionRange(cursorPosition, cursorPosition);

      // Restore the scroll position after updating
      this.textArea.scrollTop = scrollTop;

      // Update the cell content
      if (this.onUpdateCell) {
        const timestamp = this.cell.timestamp;
        this.onUpdateCell(timestamp, this.textArea.value, 'markdown');
      }

      return; // Exit after handling lists
    }

    // Add the Markdown syntax around the selected text
    const newText =
      text.slice(0, start) + prefix + selectedText + suffix + text.slice(end);
    this.textArea.value = newText;

    // Calculate the new cursor position
    const cursorPosition = start + prefix.length + selectedText.length;

    // Restore focus to the textarea
    this.textArea.focus();
    this.textArea.setSelectionRange(cursorPosition, cursorPosition);

    // Restore the scroll position explicitly
    this.textArea.scrollTop = scrollTop;

    // Update the cell content
    if (this.onUpdateCell) {
      const timestamp = this.cell.timestamp;
      this.onUpdateCell(timestamp, this.textArea.value, 'markdown');
    }
  }
}
