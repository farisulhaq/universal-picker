/**
 * Simple build script to create minified version.
 * No external dependencies - uses basic JS minification.
 */
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'UniversalPicker.js'), 'utf8');

// Basic minification: remove comments, collapse whitespace
let min = src
    // Remove block comments (but keep /*! license comments)
    .replace(/\/\*(?!\!)[^*]*\*+(?:[^/*][^*]*\*+)*\//g, '')
    // Remove single-line comments
    .replace(/(?<!:)\/\/.*$/gm, '')
    // Collapse multiple newlines
    .replace(/\n\s*\n/g, '\n')
    // Remove leading whitespace on lines
    .replace(/^\s+/gm, '')
    // Remove trailing whitespace
    .replace(/\s+$/gm, '')
    // Collapse spaces around operators (basic)
    .replace(/\s*([{}();,=+\-<>!&|?:])\s*/g, '$1')
    // Restore necessary spaces
    .replace(/\bvar\b/g, 'var ')
    .replace(/\breturn\b/g, 'return ')
    .replace(/\bfunction\b/g, 'function ')
    .replace(/\btypeof\b/g, 'typeof ')
    .replace(/\binstanceof\b/g, 'instanceof ')
    .replace(/\bnew\b/g, 'new ')
    .replace(/\bthis\b\./g, 'this.')
    .replace(/\belse\b/g, ' else ')
    .replace(/\bin\b/g, ' in ')
    .replace(/\bdelete\b/g, 'delete ')
    .replace(/\bthrow\b/g, 'throw ')
    .replace(/\bvoid\b/g, 'void ');

// Add banner
const banner = '/*! UniversalPicker.js v2.0.0 | MIT License | github.com/farisulhaq/universal-picker */\n';
min = banner + min;

fs.writeFileSync(path.join(__dirname, 'UniversalPicker.min.js'), min, 'utf8');

const origSize = Buffer.byteLength(src, 'utf8');
const minSize = Buffer.byteLength(min, 'utf8');
const ratio = ((1 - minSize / origSize) * 100).toFixed(1);

console.log(`Build complete!`);
console.log(`  Original:  ${(origSize / 1024).toFixed(1)} KB`);
console.log(`  Minified:  ${(minSize / 1024).toFixed(1)} KB (${ratio}% smaller)`);
console.log(`  Output:    UniversalPicker.min.js`);
