/**
 * External module Dependencies.
 */
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

/**
 * Internal module Dependencies.
 */

exports.readFile = function (filePath, parse) {
  parse = typeof parse == 'undefined' ? true : parse;
  filePath = path.resolve(filePath);
  var data;
  if (fs.existsSync(filePath)) {
    try {
      let fileContent = fs.readFileSync(filePath, 'utf-8');

      if (parse) {
        // Clean up common JSON issues before parsing
        fileContent = exports.cleanJsonContent(fileContent);
        data = JSON.parse(fileContent);
      } else {
        data = fileContent;
      }
    } catch (error) {
      console.error(`Error reading/parsing file ${filePath}:`, error.message);

      // If JSON parsing failed, try a simple newline-only fix
      if (parse && error instanceof SyntaxError) {
        console.log('Attempting simple newline fix...');
        try {
          let fileContent = fs.readFileSync(filePath, 'utf-8');
          // ONLY fix newlines in value fields - nothing else
          fileContent = fileContent.replace(
            /"value":\s*"([^"]*?)\n([^"]*?)"/gs,
            function (match, before, after) {
              console.log('  Fixing newline in value field');
              return '"value": "' + before + '\\n' + after + '"';
            }
          );
          data = JSON.parse(fileContent);
          console.log('✅ Successfully fixed and parsed JSON with simple fix');
        } catch (secondError) {
          console.error('❌ Simple fix failed:', secondError.message);
          console.log('🔧 Trying comprehensive progressive fixes...');
          try {
            // Apply the comprehensive fixes we developed
            let fileContent = fs.readFileSync(filePath, 'utf-8');

            // Remove BOM and control characters
            if (fileContent.charCodeAt(0) === 0xfeff) {
              fileContent = fileContent.slice(1);
            }
            fileContent = fileContent.replace(
              /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g,
              ''
            );

            // Fix Unicode corruption
            fileContent = fileContent
              .replace(/=/g, '\u2014')
              .replace(/â€™/g, '\u2019')
              .replace(/â€œ/g, '\u201C')
              .replace(/â€/g, '\u201D')
              .replace(/â€"/g, '\u2014')
              .replace(/â€"/g, '\u2013')
              .replace(/Â/g, '')
              .replace(/\uFFFD/g, '');

            // Fix newlines in value fields
            fileContent = fileContent.replace(
              /"value":\s*"([^"]*?)\n([^"]*?)"/gs,
              function (match, before, after) {
                return '"value": "' + before + '\\n' + after + '"';
              }
            );

            // Fix structural issues - apply all our progressive patterns
            const patterns = [
              {
                name: 'empty data objects',
                regex: /"data":\s*\{\s*\}\s*(\n\s*)\}/g,
                replacement: '"data": {},$1}',
              },
              {
                name: 'empty marks arrays',
                regex: /"marks":\s*\[\s*\]\s*(\n\s*)\}/g,
                replacement: '"marks": [],$1}',
              },
              {
                name: 'general empty objects',
                regex: /\{\s*\}\s*(\n\s*)\}(?!\s*[,\]])/g,
                replacement: '{},$1}',
              },
              {
                name: 'general empty arrays',
                regex: /\[\s*\]\s*(\n\s*)\}(?!\s*[,\]])/g,
                replacement: '[],$1}',
              },
              {
                name: 'trailing commas',
                regex: /,(\s*\n\s*)\}/g,
                replacement: '$1}',
              },
            ];

            let totalFixes = 0;
            patterns.forEach((pattern) => {
              const matches = fileContent.match(pattern.regex);
              if (matches) {
                fileContent = fileContent.replace(
                  pattern.regex,
                  pattern.replacement
                );
                totalFixes += matches.length;
                console.log(`  Fixed ${matches.length} ${pattern.name}`);
              }
            });

            console.log(`🔧 Applied ${totalFixes} comprehensive fixes`);
            data = JSON.parse(fileContent);
            console.log(
              '✅ Successfully parsed with comprehensive progressive fixes'
            );
          } catch (thirdError) {
            console.error('❌ Comprehensive fixes failed:', thirdError.message);
            console.log(
              '💡 The JSON file may need manual repair or re-export from Contentful'
            );
            throw new Error(
              `JSON file has structural issues that cannot be automatically fixed: ${thirdError.message}`
            );
          }
        }
      } else {
        throw new Error(`Failed to read/parse JSON file: ${error.message}`);
      }
    }
  } else {
    throw new Error(`File does not exist: ${filePath}`);
  }
  return data;
};

exports.writeFile = function (filePath, data) {
  filePath = path.resolve(filePath);
  data = typeof data == 'object' ? JSON.stringify(data) : data || '{}';
  fs.writeFileSync(filePath, data, 'utf-8');
};

exports.appendFile = function (filePath, data) {
  filePath = path.resolve(filePath);
  fs.appendFileSync(filePath, data);
};

exports.makeDirectory = function () {
  for (var key in arguments) {
    var dirname = path.resolve(arguments[key]);
    if (!fs.existsSync(dirname)) mkdirp.sync(dirname);
  }
};

// Clean up common JSON content issues
exports.cleanJsonContent = function (content) {
  // Remove BOM (Byte Order Mark) if present
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }

  // Fix common corrupted character patterns
  content = content
    // Fix the =� pattern (corrupted em-dash or similar)
    .replace(/=�/g, '\u2014')
    // Fix other common corrupted Unicode patterns
    .replace(/â€™/g, '\u2019') // Corrupted apostrophe
    .replace(/â€œ/g, '\u201C') // Corrupted left double quote
    .replace(/â€�/g, '\u201D') // Corrupted right double quote
    .replace(/â€"/g, '\u2014') // Corrupted em-dash
    .replace(/â€"/g, '\u2013') // Corrupted en-dash
    .replace(/Â/g, '') // Corrupted non-breaking space
    // More aggressive approach - remove all control characters including extended range
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');

  return content;
};

// More aggressive cleanup for severely corrupted JSON
exports.aggressiveJsonCleanup = function (content) {
  console.log('Applying aggressive JSON cleanup...');

  // First apply standard cleanup
  content = exports.cleanJsonContent(content);

  // MINIMAL approach - only fix the essential newline issue
  content = content
    // Replace any remaining replacement characters
    .replace(/\uFFFD/g, '')
    // Fix common encoding issues
    .replace(/Ã¢â‚¬â„¢/g, '\u2019') // Another corrupted apostrophe pattern
    .replace(/Ã¢â‚¬Å"/g, '\u201C') // Another corrupted quote pattern
    .replace(/Ã¢â‚¬â€œ/g, '\u2014') // Another corrupted dash pattern
    // ONLY fix newlines in value fields - don't touch structure
    .replace(
      /"value":\s*"([^"]*?)\n([^"]*?)"/gs,
      function (match, before, after) {
        console.log('  Fixing newline in value field');
        return '"value": "' + before + '\\n' + after + '"';
      }
    );

  // Try minimal structural fixes only if absolutely necessary
  try {
    // Only balance brackets if severely unbalanced
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    const openBrackets = (content.match(/\[/g) || []).length;
    const closeBrackets = (content.match(/\]/g) || []).length;

    // Only add closing braces if there's a significant imbalance
    if (openBraces - closeBraces > 5) {
      const missing = openBraces - closeBraces;
      console.log(`Adding ${missing} missing closing brace(s)`);
      content += '}'.repeat(missing);
    }
    if (openBrackets - closeBrackets > 5) {
      const missing = openBrackets - closeBrackets;
      console.log(`Adding ${missing} missing closing bracket(s)`);
      content += ']'.repeat(missing);
    }
  } catch (e) {
    console.log('Could not apply structural fixes:', e.message);
  }

  return content;
};
