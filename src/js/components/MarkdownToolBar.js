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

      this.textArea.scrollTop = scrollTop;

      if (this.onUpdateCell) {
        const timestamp = this.cell.timestamp;
        this.onUpdateCell(timestamp, this.textArea.value, 'markdown');
      }

      return;
    }
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
      const isShortcutKey = event.ctrlKey || event.metaKey;
      if (!isShortcutKey || !this.textArea) return;

      const key = event.key.toLowerCase();

      // Define a map of recognized shortcuts
      const shortcuts = {
        b: { prefix: '**', suffix: '**' },
        i: { prefix: '*', suffix: '*' },
        u: { prefix: '<u>', suffix: '</u>' },
        s: event.shiftKey ? { prefix: '~~', suffix: '~~' } : null,
        l: { prefix: '- ', suffix: '' },
        '`': { prefix: '```', suffix: '```' },
        h: { prefix: '', suffix: '\n---' },
        k: { prefix: '[', suffix: '](url)' },
      };

      const shortcut = shortcuts[key];

      // Only prevent default if the shortcut is recognized
      if (shortcut) {
        event.preventDefault();
        if (shortcut.prefix !== undefined && shortcut.suffix !== undefined) {
          this.insertMarkdown(shortcut.prefix, shortcut.suffix);
        }
      }
    });
  }
}
