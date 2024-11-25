const fs = require('fs');

const acorn = require('acorn');

const files = ['./src/js/testFunctions.js']; // Add your file paths here

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8');
  const parsed = acorn.parse(content, { ecmaVersion: 2020 });

  let updatedContent = content; // Keep track of updated content
  // Go through each node and add JSDoc before function declarations
  let offset = 0; // Offset to adjust for the changing positions after each insertion
  parsed.body.forEach((node) => {
    if (node.type === 'FunctionDeclaration') {
      const functionName = node.id.name;
      const params = node.params.map((param) => param.name).join(', ');

      const jsdocComment = `/**\n * Function: ${functionName}\n * @param {type} ${params}\n * @returns {type} Description of the return value\n */\n`;

      // Adjust the positions based on the current offset
      updatedContent =
        updatedContent.slice(0, node.start + offset) +
        jsdocComment +
        updatedContent.slice(node.start + offset);

      // Update offset to account for the added comment length
      offset += jsdocComment.length;
    }
  });

  // After processing all functions, write the final updated content to the file
  fs.writeFileSync(file, updatedContent);
});
