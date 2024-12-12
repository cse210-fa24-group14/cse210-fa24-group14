export function parseMarkdown(markdownText) {
  const rules = [
    { regex: /###### (.*?)(\n|$)/g, replacement: '<h6>$1</h6>' },
    { regex: /##### (.*?)(\n|$)/g, replacement: '<h5>$1</h5>' },
    { regex: /#### (.*?)(\n|$)/g, replacement: '<h4>$1</h4>' },
    { regex: /### (.*?)(\n|$)/g, replacement: '<h3>$1</h3>' },
    { regex: /## (.*?)(\n|$)/g, replacement: '<h2>$1</h2>' },
    { regex: /# (.*?)(\n|$)/g, replacement: '<h1>$1</h1>' },

    // Handle bold
    { regex: /\*\*(.*?)\*\*/g, replacement: '<strong>$1</strong>' },

    // Handle italic
    { regex: /\*(.*?)\*/g, replacement: '<em>$1</em>' },

    // Handle strikethrough
    { regex: /~~(.*?)~~/g, replacement: '<del>$1</del>' },

    // Multi-line code blocks
    {
      regex: /```([\s\S]*?)```/g,
      replacement: '<pre><code>$1</code></pre>',
    },

    // Handle horizontal rules
    // Handle --- after a heading (horizontal rule case)
    { regex: /(\n?)\n?---\n/g, replacement: '\n<hr />\n' },

    // Replace any remaining newlines carefully after horizontal rules
    { regex: /(?<!^)\n(?!$)/g, replacement: '<br />' },

    // Handle links
    {
      regex: /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\S+)\)/g,
      replacement:
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    },

    {
      regex: /(?<!<\/li>|<\/ul>|<\/ol>|<\/h\d>|<\/pre>)\n/g,
      replacement: '<br />',
    },
  ];

  // Handle nested lists specifically
  function handleLists(markdown) {
    const lines = markdown.split('\n');
    let html = '';
    const stack = []; // Keeps track of current list levels

    lines.forEach((line) => {
      const headingMatch = line.match(/^(#{1,6})\s+(.*)/); // Match headings dynamically
      const listMatch = line.match(/^(\s*)-\s+(.*)/);

      if (headingMatch) {
        const level = headingMatch[1].length; // Number of `#` determines heading level
        const content = headingMatch[2];

        // Close any open lists before adding a heading
        while (stack.length > 0) {
          html += '</ul>';
          stack.pop();
        }

        html += `<h${level}>${content}</h${level}><br />`;
      } else if (listMatch) {
        const indent = listMatch[1].length; // Number of spaces determines nesting level
        const content = listMatch[2];

        while (stack.length > 0 && stack[stack.length - 1] > indent) {
          // Close deeper levels
          html += '</ul>';
          stack.pop();
        }

        if (stack.length === 0 || stack[stack.length - 1] < indent) {
          // Start a new nested list
          html += '<ul>';
          stack.push(indent);
        }

        // Add the list item
        html += `<li>${content}</li>`;
      } else {
        // Close all remaining open lists when the line isn't a list
        while (stack.length > 0) {
          html += '</ul>';
          stack.pop();
        }
        html += line + '\n'; // Non-list content, leave it unchanged
      }
    });

    // Close any remaining open lists at the end
    while (stack.length > 0) {
      html += '</ul>';
      stack.pop();
    }

    return html;
  }

  let htmlText = markdownText;

  // First, process nested lists
  htmlText = handleLists(htmlText);

  console.log(htmlText);
  // Then, apply other markdown rules
  rules.forEach((rule) => {
    htmlText = htmlText.replace(rule.regex, rule.replacement);
  });
  console.log(htmlText);
  return htmlText;
}
