import { parseMarkdown } from '../../src/js/markdownRules';

describe('Util ParseMarkdown', () => {
  test('should not parse empty string', () => {
    const parseMarkdownOut = parseMarkdown('');

    expect(parseMarkdownOut).toBe('<br />');
  });

  test('should parse header 1', () => {
    const input = '# Header 1';
    const parseMarkdownOut = parseMarkdown(input);
    expect(parseMarkdownOut).toBe('<h1>Header 1</h1><br />');
  });

  test('should parse header 2', () => {
    const input = '## Header 2';
    const parseMarkdownOut = parseMarkdown(input);
    expect(parseMarkdownOut).toBe('<h2>Header 2</h2><br />');
  });

  test('should parse header 6', () => {
    const input = '###### Header 6';
    const parseMarkdownOut = parseMarkdown(input);
    expect(parseMarkdownOut).toBe('<h6>Header 6</h6><br />');
  });

  test('should parse bold text', () => {
    const input = '**bold**';
    const parseMarkdownOut = parseMarkdown(input);
    expect(parseMarkdownOut).toBe('<strong>bold</strong><br />');
  });

  test('should parse italic text', () => {
    const input = '*italic*';
    const parseMarkdownOut = parseMarkdown(input);
    expect(parseMarkdownOut).toBe('<em>italic</em><br />');
  });

  test('should parse strikethrough text', () => {
    const input = '~~strikethrough~~';
    const parseMarkdownOut = parseMarkdown(input);
    expect(parseMarkdownOut).toBe('<del>strikethrough</del><br />');
  });

  test('should parse multiline code', () => {
    const input = '```code```';
    let parseMarkdownOut = parseMarkdown(input);
    expect(parseMarkdownOut.trim()).toBe('<pre><code>code</code></pre>');
  });

  test('should parse line breaks', () => {
    const input = 'line 1\nline 2';
    const parseMarkdownOut = parseMarkdown(input);
    expect(parseMarkdownOut).toBe('line 1<br />line 2<br />');
  });

  test('should parse links', () => {
    const input = '[alt text](https://example.com)';
    const parseMarkdownOut = parseMarkdown(input);
    expect(parseMarkdownOut).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">alt text</a><br />',
    );
  });

  test('should parse header 1', () => {
    const input = '# Header 1\n';
    const parseMarkdownOut = parseMarkdown(input);
    expect(parseMarkdownOut).toBe('<h1>Header 1</h1><br /><br />');
  });

  test('should parse a combination of markdown features', () => {
    const input = `# Header 1
      ## Header 2
      ###### Header 6
      **bold**
      *italic*
      ~~strikethrough~~
      \`\`\`code\`\`\`
      [alt text](https://example.com)`;

    let parseMarkdownOut = parseMarkdown(input);
    parseMarkdownOut = parseMarkdownOut.replace(/>\s+</g, '><');
    // Expected output
    expect(parseMarkdownOut).toBe(
      `<h1>Header 1</h1><br /><h2>Header 2</h2><h6>Header 6</h6><strong>bold</strong><br /><em>italic</em><br /><del>strikethrough</del><br /><pre><code>code</code></pre><br /><a href="https://example.com" target="_blank" rel="noopener noreferrer">alt text</a><br />`,
    );
  });
});
