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

  const initializeSyntaxRules = () =>{
    for (const lang in syntaxRules) {
      const keywords = syntaxRules[lang].keywords.join('|');
      syntaxRules[lang].patterns.keyword = new RegExp(`\\b(${keywords})\\b`, 'g');
    }
    return syntaxRules;
  }
  
  export const newapplySyntaxHighlighting =(code, language) => {
    //const code = codeTextarea.value;
    if (!syntaxRules[language].patterns.keyword) {
        initializeSyntaxRules();
      }
    const rules = syntaxRules[language].patterns;
  
    return code.replace(
        new RegExp(
          rules.comment.source +
            '|' +
            rules.string.source +
            '|' +
            rules.keyword.source +
            '|' +
            rules.number.source +
            '|' +
            rules.function.source,
          'g'
        ),
        (match) => {
          if (rules.comment.test(match)) {
            return `<span class="token comment">${match}</span>`;
          } else if (rules.string.test(match)) {
            return `<span class="token string">${match}</span>`;
          } else if (rules.keyword.test(match)) {
            return `<span class="token keyword">${match}</span>`;
          } else if (rules.number.test(match)) {
            return `<span class="token number">${match}</span>`;
          } else if (rules.function.test(match)) {
            return `<span class="token function">${match}</span>`;
          }
          return match;
        }
      );
    };

  export const applySyntaxHighlightingWithErrors = (code, language) => {
    if (!syntaxRules[language].patterns.keyword) {
        initializeSyntaxRules();
      }
    const syntaxHighlightedCode = newapplySyntaxHighlighting(code, language);
    const errors = checkSyntax(code, language);
    const highlightedWithErrors = highlightErrors(syntaxHighlightedCode, errors);
  
    return highlightedWithErrors;
  }
  
   const checkSyntax = (code, language)=> {
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
   const checkPythonSyntax = (code, rules) =>{
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
   const checkCStyleSyntax = (code, rules) => {
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
   const checkHTMLSyntax = (code, rules) => {
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
   const checkCSSSyntax = (code, rules) =>{
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
   const commonSyntaxChecks = (code, rules) =>{
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
        }
      );
    });
  
    return lines.join('\n');
  };
