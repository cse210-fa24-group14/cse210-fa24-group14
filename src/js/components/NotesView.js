//import { SyntaxHighlighter } from "./SyntaxHighlighter";
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

    if (cell.cellType === 'code') {
      const syntaxRules = {
        python: {
          keywords: ['def', 'return', 'if', 'else', 'elif', 'for', 'while', 'break', 'continue', 'class', 'try', 'except', 'finally', 'import', 'from', 'as', 'pass', 'raise', 'with', 'lambda', 'not', 'or', 'and', 'is', 'in', 'None', 'True', 'False'],
          patterns: {
            comment: /#.*$/gm,
            string: /(["'])(?:(?=(\\?))\2.)*?\1/g,
            keyword: null, // Will be generated dynamically
            number: /\b\d+(\.\d+)?\b/g,
            function: /\b\w+(?=\()/g,
          },
        },
        c: {
          keywords: ['int', 'float', 'double', 'char', 'if', 'else', 'while', 'do', 'for', 'return', 'void', 'struct', 'typedef', 'include', 'define'],
          patterns: {
            comment: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
            string: /(["'])(?:(?=(\\?))\2.)*?\1/g,
            keyword: null,
            number: /\b\d+(\.\d+)?\b/g,
            function: /\b\w+(?=\()/g,
          },
        },
        cpp: {
            keywords: [
                'int', 'float', 'double', 'char', 'bool', 'void', 'if', 'else', 'while',
                'do', 'for', 'return', 'switch', 'case', 'default', 'break', 'continue',
                'class', 'struct', 'public', 'private', 'protected', 'virtual', 'override',
                'template', 'typename', 'namespace', 'using', 'try', 'catch', 'throw', 'new', 'delete',
                'const', 'static', 'inline', 'friend', 'operator', 'sizeof',
              ],
              patterns: {
                comment: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
                string: /(["'])(?:(?=(\\?))\2.)*?\1/g,
                keyword: null, // Generated dynamically
                number: /\b\d+(\.\d+)?\b/g,
                function: /\b\w+(?=\()/g,
              },
        },
        java: {
            keywords: [
                'class', 'interface', 'enum', 'public', 'private', 'protected', 'void',
                'static', 'final', 'abstract', 'extends', 'implements', 'new', 'return',
                'if', 'else', 'while', 'do', 'for', 'switch', 'case', 'default', 'try',
                'catch', 'finally', 'throw', 'throws', 'import', 'package', 'this', 'super',
                'instanceof', 'synchronized', 'volatile', 'transient', 'native', 'strictfp',
                'assert', 'boolean', 'byte', 'char', 'short', 'int', 'long', 'float', 'double',
                'true', 'false', 'null',
            ],
            patterns: {
                comment: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
                string: /(["'])(?:(?=(\\?))\2.)*?\1/g,
                keyword: null, // Generated dynamically
                number: /\b\d+(\.\d+)?\b/g,
                function: /\b\w+(?=\()/g,
            },
        },
        html: {
            keywords: [],
            patterns: {
                tag: /<\/?[\w-]+(\s*[\w-]+(?:=".*?")?)*\s*\/?>/g, // Matches HTML tags
                attribute: /(\w+)=(["']).*?\2/g,                  // Matches attributes within tags
                string: /(["'])(?:(?=(\\?))\2.)*?\1/g,            // Matches quoted strings
                comment: /<!--[\s\S]*?-->/gm,                     // Matches HTML comments
            },
        },
        css: {
            keywords: [],
            patterns: {
                selector: /^[^\{\}]+(?=\{)/gm,                     // Matches selectors
                property: /([\w-]+)(?=\s*:)/g,                    // Matches CSS properties
                value: /:(.+?);/g,                                // Matches CSS values
                comment: /\/\*[\s\S]*?\*\//gm,                    // Matches CSS comments
            },
        },
        js: {
            keywords: [
                'var', 'let', 'const', 'function', 'return', 'if', 'else', 'while', 'do',
                'for', 'switch', 'case', 'default', 'break', 'continue', 'try', 'catch',
                'finally', 'throw', 'new', 'class', 'extends', 'import', 'export', 'from',
                'this', 'super', 'typeof', 'instanceof', 'delete', 'in', 'of', 'true', 'false', 'null', 'undefined',
              ],
              patterns: {
                comment: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
                string: /(["'`])(?:(?=(\\?))\2.)*?\1/g, // Supports ", ', and ` for template literals
                keyword: null, // Generated dynamically
                number: /\b\d+(\.\d+)?\b/g,
                function: /\b\w+(?=\()/g,
              },
        }
        // Add similar rules for other languages...
      };
      
      // Dynamically generate keyword regex
      for (const lang in syntaxRules) {
        const keywords = syntaxRules[lang].keywords.join('|');
        syntaxRules[lang].patterns.keyword = new RegExp(`\\b(${keywords})\\b`, 'g');
      }
      // Create wrapper for the code editor components
      const codeEditorWrapper = document.createElement('div');
      codeEditorWrapper.classList.add('code-editor-wrapper');
      
      // Add language selector inside the code box
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

      const selectedLanguage = select.value;

      const highlightedCode = document.createElement('div');
      highlightedCode.classList.add('highlighted-code');
      codeEditorWrapper.appendChild(highlightedCode);

      // Create a code-specific textarea for Python
      const codeTextarea = document.createElement('textarea');
      codeTextarea.classList.add('code-editor');
      codeTextarea.placeholder = 'Write your code here...';
      codeTextarea.value = cell.content || '';

      //codeTextarea.setAttribute('rows', '100');  // Set a default number of rows

      codeTextarea.addEventListener('input', (e) => {
        const code = codeTextarea.value;
        highlightedCode.innerHTML = applySyntaxHighlighting(code, selectedLanguage);
        });

        select.addEventListener('change', (event) => {
          selectedLanguage = event.target.value;
          const code = codeTextarea.value;
          highlightedCode.innerHTML = this.applySyntaxHighlightingWithErrors(code, selectedLanguage);
      });
    
      codeTextarea.addEventListener('scroll', () => {
        highlightedCode.scrollTop = codeInput.scrollTop;
        highlightedCode.scrollLeft = codeInput.scrollLeft;
      });
      // // Prevent any potential focus or input blocking
      // codeTextarea.addEventListener('focus', (e) => {
      //   e.target.select();  // Select all text when focused
      // });

      // // Additional event listeners to ensure editability
      // codeTextarea.addEventListener('click', () => {
      //   codeTextarea.focus();
      // });

      // Add syntax highlighting
      // codeTextarea.addEventListener('input', (e) => {
      //   this.applySyntaxHighlighting(codeTextarea, selectedLanguage);
      // });
      // select.addEventListener('change', (event) => {
      //   selectedLanguage = event.target.value;
      //   const code = codeTextarea.value;
      //   // Reapply syntax highlighting and error checking
      //   highlightedCode.innerHTML = applySyntaxHighlightingWithErrors(code, selectedLanguage);
      // });
      // Save changes with debounce
      let debounceTimeout;
      codeTextarea.addEventListener('keydown', () => {
        clearTimeout(debounceTimeout);

        debounceTimeout = setTimeout(() => {
            const code = codeTextarea.value;

            // Apply syntax highlighting with errors
            const highlighted = applySyntaxHighlightingWithErrors(code, selectedLanguage);
            highlightedCode.innerHTML = highlighted;
            console.log(highlightedCode.innerHTML);
        }, 1000); // Wait 1s after typing stops
      })

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
        }
    });
  
      
      let saveTimeout;
      codeTextarea.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(
          () => this.onUpdateCell(cell.timestamp, codeTextarea.value, 'code'),
          1000
        );
      });
      codeEditorWrapper.appendChild(codeTextarea)
      cellContent.appendChild(codeEditorWrapper);
      
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

  applySyntaxHighlighting(code, language) {
    const rules = syntaxRules[language].patterns;
  
    return code
      .replace(rules.comment, '<span class="token comment">$&</span>')
      .replace(rules.string, '<span class="token string">$&</span>')
      .replace(rules.keyword, '<span class="token keyword">$&</span>')
      .replace(rules.number, '<span class="token number">$&</span>')
      .replace(rules.function, '<span class="token function">$&</span>');
  }

  applySyntaxHighlightingWithErrors(code, language) {
    const syntaxHighlightedCode = applySyntaxHighlighting(code, language);
    const errors = checkSyntax(code, language);
    const highlightedWithErrors = highlightErrors(syntaxHighlightedCode, errors);
  
    return highlightedWithErrors;
  }

  checkSyntax(code, language) {
    // Validate language support
    if (!syntaxRules[language]) {
      throw new Error(`Unsupported language: ${language}`);
    }
  
    const errors = [];
    const rules = syntaxRules[language];
  
    // Dynamically generate keyword regex if not already created
    if (!rules.patterns.keyword) {
      rules.patterns.keyword = new RegExp(`\\b(${rules.keywords.join('|')})\\b`, 'g');
    }
  
    // Language-specific preprocessing and checks
    switch (language) {
      case 'python':
        errors.push(...checkPythonSyntax(code, rules));
        break;
      case 'c':
      case 'cpp':
      case 'java':
      case 'js':
        errors.push(...checkCStyleSyntax(code, rules));
        break;
      case 'html':
        errors.push(...checkHTMLSyntax(code, rules));
        break;
      case 'css':
        errors.push(...checkCSSSyntax(code, rules));
        break;
    }
  
    // Common syntax checks across all languages
    errors.push(...commonSyntaxChecks(code, rules));
  
    return errors;
  }
  
  // Python-specific syntax checks
  checkPythonSyntax(code, rules) {
    const errors = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Indentation check
      const indentationLevel = line.length - line.trimLeft().length;
      if (trimmedLine && indentationLevel % 4 !== 0) {
        errors.push({
          message: 'Inconsistent indentation (should be multiples of 4 spaces)',
          line: index + 1,
          column: 0
        });
      }
  
      // Colon check for control structures
      const colonRequiredKeywords = ['def', 'class', 'if', 'else', 'elif', 'for', 'while'];
      const needsColon = colonRequiredKeywords.some(keyword => 
        trimmedLine.startsWith(keyword)
      );
      if (needsColon && !trimmedLine.endsWith(':')) {
        errors.push({
          message: 'Missing colon after control structure or definition',
          line: index + 1,
          column: line.length
        });
      }
    });
  
    return errors;
  }
  
  // C-style languages syntax checks (C, C++, Java, JavaScript)
  checkCStyleSyntax(code, rules) {
    const errors = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Semicolon check
      if (trimmedLine && 
          !trimmedLine.endsWith(';') && 
          !trimmedLine.endsWith('{') && 
          !trimmedLine.endsWith('}') &&
          !trimmedLine.startsWith('//') &&
          !trimmedLine.startsWith('/*') &&
          !trimmedLine.startsWith('*')) {
        errors.push({
          message: 'Missing semicolon',
          line: index + 1,
          column: line.length
        });
      }
    });
  
    return errors;
  }
  
  // HTML syntax checks
  checkHTMLSyntax(code, rules) {
    const errors = [];
    const lines = code.split('\n');
    const tagStack = [];
  
    lines.forEach((line, index) => {
      const tagMatches = line.match(rules.patterns.tag) || [];
      
      tagMatches.forEach(tag => {
        // Remove angle brackets and whitespace
        const cleanTag = tag.replace(/[<>]/g, '').trim().split(' ')[0];
        
        // Self-closing and void tags
        if (tag.endsWith('/>') || 
            ['br', 'img', 'input', 'hr', 'meta', 'link'].includes(cleanTag)) {
          return;
        }
        
        // Closing tag
        if (tag.startsWith('</')) {
          if (tagStack.length === 0 || tagStack[tagStack.length - 1] !== cleanTag) {
            errors.push({
              message: `Unexpected or mismatched closing tag: ${cleanTag}`,
              line: index + 1,
              column: line.indexOf(tag)
            });
          } else {
            tagStack.pop();
          }
        }
        // Opening tag
        else if (!tag.startsWith('</')) {
          tagStack.push(cleanTag);
        }
      });
    });
  
    // Check for unclosed tags at the end
    if (tagStack.length > 0) {
      errors.push({
        message: `Unclosed HTML tags: ${tagStack.join(', ')}`,
        line: lines.length,
        column: lines[lines.length - 1].length
      });
    }
  
    return errors;
  }
  
  // CSS syntax checks
  checkCSSSyntax(code, rules) {
    const errors = [];
    const lines = code.split('\n');
    let inBlock = false;
  
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check for mismatched braces
      const openBraceCount = (line.match(/\{/g) || []).length;
      const closeBraceCount = (line.match(/\}/g) || []).length;
      
      if (openBraceCount > 0) {
        if (inBlock) {
          errors.push({
            message: 'Unexpected opening brace',
            line: index + 1,
            column: line.indexOf('{')
          });
        }
        inBlock = true;
      }
      
      if (closeBraceCount > 0) {
        if (!inBlock) {
          errors.push({
            message: 'Unexpected closing brace',
            line: index + 1,
            column: line.indexOf('}')
          });
        }
        inBlock = false;
      }
      
      // Check for missing semicolons in property declarations
      if (inBlock && 
          trimmedLine.includes(':') && 
          !trimmedLine.endsWith(';') && 
          !trimmedLine.endsWith('{') && 
          !trimmedLine.endsWith('}')) {
        errors.push({
          message: 'Missing semicolon in CSS property',
          line: index + 1,
          column: line.length
        });
      }
    });
  
    return errors;
  }
  
  // Common syntax checks across all languages
  commonSyntaxChecks(code, rules) {
    const errors = [];
  
    // Remove comments from the code
    const cleanCode = code.replace(rules.patterns.comment, '');
  
    // Check for unbalanced brackets, parentheses, and braces
    const bracketPairs = {
      '(': ')',
      '[': ']',
      '{': '}'
    };
  
    const brackets = {
      '(': 0,
      '[': 0,
      '{': 0
    };
  
    for (const char of cleanCode) {
      if (char in brackets) {
        brackets[char]++;
      }
      if (Object.values(bracketPairs).includes(char)) {
        const openBracket = Object.keys(bracketPairs).find(key => bracketPairs[key] === char);
        if (brackets[openBracket] > 0) {
          brackets[openBracket]--;
        } else {
          errors.push({
            message: `Unbalanced ${char} bracket`,
            line: 0,
            column: 0
          });
        }
      }
    }
  
    // Check for unbalanced brackets at the end
    Object.entries(brackets).forEach(([bracket, count]) => {
      if (count > 0) {
        errors.push({
          message: `Unclosed ${bracket} bracket`,
          line: 0,
          column: 0
        });
      }
    });
  
    return errors;
  }

  highlightErrors(code, errors) {
    const lines = code.split('\n');
    errors.forEach((error) => {
      const lineIndex = error.line;
      const line = lines[lineIndex];
  
      // Highlight the error on the line
      lines[lineIndex] = line.replace(
        line.trim(),
        `<span class="error" data-tooltip="${error.message}">${line.trim()}</span>`
      );
    });
  
    return lines.join('\n');
  }

  applySyntaxHighlightingWithErrors(code, language) {
    const syntaxHighlightedCode = applySyntaxHighlighting(code, language);
    const errors = checkSyntax(code, language);
    const highlightedWithErrors = highlightErrors(syntaxHighlightedCode, errors);
  
    return highlightedWithErrors;
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
