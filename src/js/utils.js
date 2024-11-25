export function parseMarkdown(markdownText) {
  // Simple Markdown to HTML parser
  const rules = [
    { regex: /###### (.*?)(\n|$)/g, replacement: '<h6>$1</h6>' },
    { regex: /##### (.*?)(\n|$)/g, replacement: '<h5>$1</h5>' },
    { regex: /#### (.*?)(\n|$)/g, replacement: '<h4>$1</h4>' },
    { regex: /### (.*?)(\n|$)/g, replacement: '<h3>$1</h3>' },
    { regex: /## (.*?)(\n|$)/g, replacement: '<h2>$1</h2>' },
    { regex: /# (.*?)(\n|$)/g, replacement: '<h1>$1</h1>' },
    { regex: /\*\*(.*?)\*\*/g, replacement: '<strong>$1</strong>' },
    { regex: /\*(.*?)\*/g, replacement: '<em>$1</em>' },
    { regex: /~~(.*?)~~/g, replacement: '<del>$1</del>' },
    { regex: /`(.*?)`/g, replacement: '<code>$1</code>' },
    { regex: /\n-{3,}\n/g, replacement: '<hr />' },
    { regex: /\n/g, replacement: '<br />' },
    {
      regex: /\b(https?:\/\/[^\s]+)\b/g,
      replacement:
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
    },
    {
      regex: /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
      replacement: '<a href="mailto:$1">$1</a>',
    },
    /* 
        Change font size
        example use: 
        {{size=24}} This is 24px text
        {{size=16}} This is 16px text
      */
    {
      regex: /\{\{size=(\d+)\}\}(.*?)(?=\{\{size=|\n|$)/g,
      replacement: '<span style="font-size:$1px">$2</span>',
    },
  ];

  let htmlText = markdownText;
  rules.forEach((rule) => {
    htmlText = htmlText.replace(rule.regex, rule.replacement);
  });

  return htmlText;
}
