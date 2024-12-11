/* eslint-disable no-useless-escape */
/**
 * @typedef {Object} SyntaxRules
 * @property {Object} [lang] - Language-specific syntax rules.
 * @property {Object} patterns - Regex patterns for token types like comments, strings, keywords, etc.
 */

/**
 * @type {SyntaxRules}
 */
const syntaxRules = {
  python: {
    patterns: {
      comment: /\s*#.*/,
      string: /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/,
      keyword:
        /\b(and|as|assert|break|class|continue|def|del|elif|else|except|False|finally|for|from|global|if|import|in|is|lambda|None|nonlocal|not|or|pass|raise|return|True|try|while|with|yield)\b/,
      builtinFunction:
        /\b(print|len|range|type|int|str|float|list|dict|set|tuple|sum|min|max|abs|round|input)\b/,
      number: /\b(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?\b/,
      operator:
        /(\+|\-|\*|\/|%|\*\*|==|!=|<=|>=|<|>|=|\+=|\-=|\*=|\/=|%=|\*\*=)/,
      function: /\b[a-zA-Z_]\w*(?=\s*\()/,
    },
  },
};

/**
 * Initialize syntax rules by creating the keyword regex.
 * 
 * @returns {SyntaxRules} The initialized syntax rules.
 */
const initializeSyntaxRules = () => {
  for (const lang in syntaxRules) {
    const keywords = syntaxRules[lang].keywords.join('|');
    syntaxRules[lang].patterns.keyword = new RegExp(`\\b(${keywords})\\b`, 'g');
  }
  return syntaxRules;
};

/**
 * Applies syntax highlighting to the given code.
 * 
 * @param {string} code - The code to be highlighted.
 * @returns {string} The syntax-highlighted code.
 */
export const newapplySyntaxHighlighting = (code) => {
  // Comprehensive syntax rules for Python
  const syntaxRules = {
    python: {
      patterns: {
        comment: /\s*#.*/,
        string: /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/,
        keyword:
          /\b(and|as|assert|break|class|continue|def|del|elif|else|except|False|finally|for|from|global|if|import|in|is|lambda|None|nonlocal|not|or|pass|raise|return|True|try|while|with|yield)\b/,
        builtinFunction:
          /\b(print|len|range|type|int|str|float|list|dict|set|tuple|sum|min|max|abs|round|input)\b/,
        number: /\b(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?\b/,
        operator:
          /(\+|\-|\*|\/|%|\*\*|==|!=|<=|>=|<|>|=|\+=|\-=|\*=|\/=|%=|\*\*=)/,
        function: /\b[a-zA-Z_]\w*(?=\s*\()/,
      },
    },
  };

  // Combine all regex patterns
  const createCombinedRegex = () => {
    const rules = syntaxRules.python.patterns;
    return new RegExp(
      [
        rules.comment.source,
        rules.string.source,
        rules.keyword.source,
        rules.builtinFunction.source,
        rules.number.source,
        rules.function.source,
        rules.operator.source,
      ].join('|'),
      'g',
    );
  };

  // Apply syntax highlighting
  const highlightedCode = code.replace(createCombinedRegex(), (match) => {
    const rules = syntaxRules.python.patterns;

    // Check and apply highlighting for different token types
    if (rules.comment.test(match)) {
      return `<span class="token comment">${match}</span>`;
    } else if (rules.string.test(match)) {
      return `<span class="token string">${match}</span>`;
    } else if (rules.keyword.test(match)) {
      return `<span class="token keyword">${match}</span>`;
    } else if (rules.builtinFunction.test(match)) {
      return `<span class="token builtin">${match}</span>`;
    } else if (rules.number.test(match)) {
      return `<span class="token number">${match}</span>`;
    } else if (rules.function.test(match)) {
      return `<span class="token function">${match}</span>`;
    } else if (rules.operator.test(match)) {
      return `<span class="token operator">${match}</span>`;
    }

    return match;
  });

  return highlightedCode;
};

/**
 * Applies syntax highlighting and highlights errors in the given code.
 * 
 * @param {string} code - The code to be highlighted.
 * @param {string} language - The programming language for syntax rules.
 * @returns {string} The syntax-highlighted code with errors highlighted.
 */
export const applySyntaxHighlightingWithErrors = (code, language) => {
  if (!syntaxRules[language].patterns.keyword) {
    initializeSyntaxRules();
  }
  const syntaxHighlightedCode = newapplySyntaxHighlighting(code, language);
  const errors = checkSyntax(code, language);
  const highlightedWithErrors = highlightErrors(syntaxHighlightedCode, errors);

  return highlightedWithErrors;
};

/**
 * Checks for syntax errors in the given code based on the language.
 * 
 * @param {string} code - The code to be checked.
 * @param {string} language - The programming language to check for.
 * @returns {SyntaxError[]} A list of syntax errors found in the code.
 */
const checkSyntax = (code, language) => {
  // Validate language support
  if (!syntaxRules[language]) {
    throw new Error(`Unsupported language: ${language}`);
  }

  if (!syntaxRules[language].patterns.keyword) {
    initializeSyntaxRules();
  }

  const errors = [];
  const rules = syntaxRules[language];

  // Dynamically generate keyword regex if not already created
  if (!rules.patterns.keyword) {
    rules.patterns.keyword = new RegExp(
      `\\b(${rules.keywords.join('|')})\\b`,
      'g',
    );
  }

  // Language-specific preprocessing and checks
  switch (language) {
    case 'python':
      errors.push(...checkPythonSyntax(code));
      break;
    case 'c':
    case 'cpp':
    case 'java':
    case 'js':
      errors.push(...checkCStyleSyntax(code));
      break;
    case 'html':
      errors.push(...checkHTMLSyntax(code, rules));
      break;
    case 'css':
      errors.push(...checkCSSSyntax(code));
      break;
  }

  // Common syntax checks across all languages
  errors.push(...commonSyntaxChecks(code, rules));

  return errors;
};

/**
 * Checks for syntax errors specific to Python.
 * 
 * @param {string} code - The Python code to check.
 * @returns {SyntaxError[]} A list of Python-specific syntax errors.
 */
const checkPythonSyntax = (code) => {
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
        column: 0,
      });
    }

    // Colon check for control structures
    const colonRequiredKeywords = [
      'def',
      'class',
      'if',
      'else',
      'elif',
      'for',
      'while',
    ];
    const needsColon = colonRequiredKeywords.some((keyword) =>
      trimmedLine.startsWith(keyword),
    );
    if (needsColon && !trimmedLine.endsWith(':')) {
      errors.push({
        message: 'Missing colon after control structure or definition',
        line: index + 1,
        column: line.length,
      });
    }
  });

  return errors;
};

/**
 * Checks for syntax errors in C-style languages (C, C++, Java, JavaScript).
 * 
 * @param {string} code - The code to check.
 * @returns {SyntaxError[]} A list of syntax errors for C-style languages.
 */
const checkCStyleSyntax = (code) => {
  const errors = [];
  const lines = code.split('\n');

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Semicolon check
    if (
      trimmedLine &&
      !trimmedLine.endsWith(';') &&
      !trimmedLine.endsWith('{') &&
      !trimmedLine.endsWith('}') &&
      !trimmedLine.startsWith('//') &&
      !trimmedLine.startsWith('/*') &&
      !trimmedLine.startsWith('*')
    ) {
      errors.push({
        message: 'Missing semicolon',
        line: index + 1,
        column: line.length,
      });
    }
  });

  return errors;
};

/**
 * Checks for syntax errors in HTML code.
 * 
 * @param {string} code - The HTML code to check.
 * @param {Object} rules - The syntax rules for HTML.
 * @returns {SyntaxError[]} A list of HTML-specific syntax errors.
 */
const checkHTMLSyntax = (code, rules) => {
  const errors = [];
  const lines = code.split('\n');
  const tagStack = [];

  lines.forEach((line, index) => {
    const tagMatches = line.match(rules.patterns.tag) || [];

    tagMatches.forEach((tag) => {
      // Remove angle brackets and whitespace
      const cleanTag = tag.replace(/[<>]/g, '').trim().split(' ')[0];

      // Self-closing and void tags
      if (
        tag.endsWith('/>') ||
        ['br', 'img', 'input', 'hr', 'meta', 'link'].includes(cleanTag)
      ) {
        return;
      }

      // Closing tag
      if (tag.startsWith('</')) {
        if (
          tagStack.length === 0 ||
          tagStack[tagStack.length - 1] !== cleanTag
        ) {
          errors.push({
            message: `Unexpected or mismatched closing tag: ${cleanTag}`,
            line: index + 1,
            column: line.indexOf(tag),
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
      column: lines[lines.length - 1].length,
    });
  }

  return errors;
};

/**
 * Checks for syntax errors in CSS code.
 * 
 * @param {string} code - The CSS code to check.
 * @returns {SyntaxError[]} A list of CSS-specific syntax errors.
 */
const checkCSSSyntax = (code) => {
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
          column: line.indexOf('{'),
        });
      }
      inBlock = true;
    }

    if (closeBraceCount > 0) {
      if (!inBlock) {
        errors.push({
          message: 'Unexpected closing brace',
          line: index + 1,
          column: line.indexOf('}'),
        });
      }
      inBlock = false;
    }

    // Check for missing semicolons in property declarations
    if (
      inBlock &&
      trimmedLine.includes(':') &&
      !trimmedLine.endsWith(';') &&
      !trimmedLine.endsWith('{') &&
      !trimmedLine.endsWith('}')
    ) {
      errors.push({
        message: 'Missing semicolon in CSS property',
        line: index + 1,
        column: line.length,
      });
    }
  });

  return errors;
};

/**
 * Common syntax checks applied to all languages.
 * 
 * @param {string} code - The code to check.
 * @param {Object} rules - The syntax rules to apply.
 * @returns {SyntaxError[]} A list of common syntax errors.
 */
const commonSyntaxChecks = (code, rules) => {
  const errors = [];

  // Remove comments from the code
  const cleanCode = code.replace(rules.patterns.comment, '');

  // Check for unbalanced brackets, parentheses, and braces
  const bracketPairs = {
    '(': ')',
    '[': ']',
    '{': '}',
  };

  const brackets = {
    '(': 0,
    '[': 0,
    '{': 0,
  };

  for (const char of cleanCode) {
    if (char in brackets) {
      brackets[char]++;
    }
    if (Object.values(bracketPairs).includes(char)) {
      const openBracket = Object.keys(bracketPairs).find(
        (key) => bracketPairs[key] === char,
      );
      if (brackets[openBracket] > 0) {
        brackets[openBracket]--;
      } else {
        errors.push({
          message: `Unbalanced ${char} bracket`,
          line: 0,
          column: 0,
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
        column: 0,
      });
    }
  });

  return errors;
};

/**
 * Highlights the errors in the given code.
 * 
 * @param {string} code - The code to highlight errors in.
 * @param {SyntaxError[]} errors - The syntax errors to highlight.
 * @returns {string} The code with highlighted errors.
 */
const highlightErrors = (code, errors) => {
  const lines = code.split('\n');
  errors.forEach((error) => {
    const lineIndex = error.line;
    const line = lines[lineIndex];

    // Highlight the error on the line
    lines[lineIndex] = line.replace(
      new RegExp(`(^\\s*)(${line.trim()})`, 'g'),
      (match, spaces, text) => {
        return `${spaces}<span class="error" data-tooltip="${error.message}">${text}</span>`;
      },
    );
  });

  return lines.join('\n');
};
