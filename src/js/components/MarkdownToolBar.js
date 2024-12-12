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
        shortcut: 'Ctrl+B / ⌘B',
      },
      {
        id: 'italic-btn',
        prefix: '*',
        suffix: '*',
        tooltip: 'Italics',
        icon: 'fa-solid fa-italic',
        shortcut: 'Ctrl+I / ⌘I',
      },
      {
        id: 'underline-btn',
        prefix: '<u>',
        suffix: '</u>',
        tooltip: 'Underline',
        icon: 'fa-solid fa-underline',
        shortcut: 'Ctrl+U / ⌘U',
      },
      {
        id: 'strikethrough-btn',
        prefix: '~~',
        suffix: '~~',
        tooltip: 'Strikethrough',
        icon: 'fa-solid fa-strikethrough',
        shortcut: 'Ctrl+Shift+S / ⌘Shift+S',
      },
      {
        id: 'unordered-list-btn',
        prefix: '- ',
        suffix: '',
        tooltip: 'List',
        icon: 'fa-solid fa-list',
        shortcut: 'Ctrl+L / ⌘L',
      },
      {
        id: 'code-btn',
        prefix: '```',
        suffix: '```',
        tooltip: 'Code Snippet',
        icon: 'fa-solid fa-code',
        shortcut: 'Ctrl+` / ⌘`',
      },
      {
        id: 'hr-btn',
        prefix: '',
        suffix: '\n---',
        tooltip: 'Horizontal Rule',
        icon: 'fa-solid fa-minus',
        shortcut: 'Ctrl+H / ⌘H',
      },
      {
        id: 'link-btn',
        prefix: '[',
        suffix: '](url)',
        tooltip: 'Link',
        icon: 'fa-solid fa-link',
        shortcut: 'Ctrl+K / ⌘K',
      },
    ];

    // Register shortcuts
    this.registerShortcuts();
  }

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

  insertMarkdown(prefix, suffix) {
    if (!this.textArea) {
      console.error('Textarea not found in the cell container.');
      return;
    }

    const scrollTop = this.textArea.scrollTop;
    const start = this.textArea.selectionStart;
    const end = this.textArea.selectionEnd;
    const text = this.textArea.value;

    const selectedText = text.slice(start, end);
    const newText =
      text.slice(0, start) + prefix + selectedText + suffix + text.slice(end);
    this.textArea.value = newText;

    const cursorPosition = start + prefix.length + selectedText.length;

    this.textArea.focus();
    this.textArea.setSelectionRange(cursorPosition, cursorPosition);
    this.textArea.scrollTop = scrollTop;

    if (this.onUpdateCell) {
      const timestamp = this.cell.timestamp;
      this.onUpdateCell(timestamp, this.textArea.value, 'markdown');
    }
  }

  registerShortcuts() {
    document.addEventListener('keydown', (event) => {
      // Check for Control (Windows/Linux) or Command (macOS)
      const isShortcutKey = event.ctrlKey || event.metaKey;
      if (!isShortcutKey || !this.textArea) return;

      const key = event.key.toLowerCase();
      event.preventDefault();

      switch (key) {
        case 'b': // Bold
          this.insertMarkdown('**', '**');
          break;
        case 'i': // Italic
          this.insertMarkdown('*', '*');
          break;
        case 'u': // Underline
          this.insertMarkdown('<u>', '</u>');
          break;
        case 's': // Strikethrough
          if (event.shiftKey) this.insertMarkdown('~~', '~~');
          break;
        case 'l': // List
          this.insertMarkdown('- ', '');
          break;
        case '`': // Code
          this.insertMarkdown('```', '```');
          break;
        case 'h': // Horizontal Rule
          this.insertMarkdown('', '\n---');
          break;
        case 'k': // Link
          this.insertMarkdown('[', '](url)');
          break;
        default:
          break;
      }
    });
  }
}