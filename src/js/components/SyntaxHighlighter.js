// export class SyntaxHighlighter{
//     checkSyntax(code, language) {
//         const errors = [];
        
//         // Example: Basic error detection for missing semicolons in JavaScript
//         if (language === 'js') {
//           const lines = code.split('\n');
//           lines.forEach((line, index) => {
//             if (line.trim() && !line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}')) {
//               errors.push({
//                 message: 'Missing semicolon',
//                 line: index,
//                 column: line.length,
//               });
//             }
//           });
//         }
//         // Add similar error checks for other languages (e.g., unclosed brackets, missing keywords, etc.)
        
//         return errors;
//       }
// }