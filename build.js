/**
 * Build script to create minified version.
 * No external dependencies - safe minification that preserves strings.
 */
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'UniversalPicker.js'), 'utf8');

/**
 * Tokenize source into strings/regex (preserved) and code (minified).
 * This ensures we never modify content inside quotes.
 */
function safeMinify(source) {
    const tokens = [];
    let i = 0;
    const len = source.length;

    while (i < len) {
        const ch = source[i];

        // Single-line comment
        if (ch === '/' && source[i + 1] === '/') {
            // Skip to end of line
            let end = source.indexOf('\n', i);
            if (end === -1) end = len;
            // Check it's not inside a URL (://)
            if (i > 0 && source[i - 1] === ':') {
                tokens.push({ type: 'code', value: source.slice(i, end) });
            }
            // else discard the comment
            i = end;
            continue;
        }

        // Block comment
        if (ch === '/' && source[i + 1] === '*') {
            let end = source.indexOf('*/', i + 2);
            if (end === -1) end = len - 2;
            end += 2;
            // Keep license comments /*!
            if (source[i + 2] === '!') {
                tokens.push({ type: 'string', value: source.slice(i, end) });
            }
            i = end;
            continue;
        }

        // String (single quote)
        if (ch === "'") {
            let end = i + 1;
            while (end < len && source[end] !== "'") {
                if (source[end] === '\\') end++; // skip escaped
                end++;
            }
            end++; // include closing quote
            tokens.push({ type: 'string', value: source.slice(i, end) });
            i = end;
            continue;
        }

        // String (double quote)
        if (ch === '"') {
            let end = i + 1;
            while (end < len && source[end] !== '"') {
                if (source[end] === '\\') end++;
                end++;
            }
            end++;
            tokens.push({ type: 'string', value: source.slice(i, end) });
            i = end;
            continue;
        }

        // Template literal (backtick)
        if (ch === '`') {
            let end = i + 1;
            while (end < len && source[end] !== '`') {
                if (source[end] === '\\') end++;
                end++;
            }
            end++;
            tokens.push({ type: 'string', value: source.slice(i, end) });
            i = end;
            continue;
        }

        // Regular code character - collect until next string/comment
        let end = i + 1;
        while (end < len) {
            const c = source[end];
            if (c === "'" || c === '"' || c === '`') break;
            if (c === '/' && (source[end + 1] === '/' || source[end + 1] === '*')) break;
            end++;
        }
        tokens.push({ type: 'code', value: source.slice(i, end) });
        i = end;
    }

    return tokens;
}

function minifyCode(code) {
    return code
        // Collapse multiple whitespace/newlines into single space
        .replace(/\s+/g, ' ')
        // Remove spaces around operators (but be careful)
        .replace(/ ?([{}();,=<>!&|?:]) ?/g, '$1')
        // Restore necessary keyword spaces
        .replace(/\bvar\b/g, 'var ')
        .replace(/\breturn\b(?![\s;}\)])/g, 'return ')
        .replace(/\bfunction\b/g, 'function ')
        .replace(/\btypeof\b/g, 'typeof ')
        .replace(/\binstanceof\b/g, 'instanceof ')
        .replace(/\bnew\b/g, 'new ')
        .replace(/\belse\b/g, ' else ')
        .replace(/\bdelete\b/g, 'delete ')
        .replace(/\bthrow\b/g, 'throw ')
        .replace(/\bvoid\b/g, 'void ')
        // 'in' keyword - only between word boundaries (not inside identifiers)
        .replace(/([a-zA-Z0-9_\$\)])in([a-zA-Z0-9_\$\(])/g, '$1 in $2');
}

// Tokenize
const tokens = safeMinify(src);

// Minify only code tokens, leave strings untouched
let min = tokens.map(function (t) {
    if (t.type === 'code') {
        return minifyCode(t.value);
    }
    return t.value;
}).join('');

// Clean up any remaining multi-spaces
min = min.replace(/  +/g, ' ').trim();

// Add banner
const banner = '/*! UniversalPicker.js v2.0.2 | MIT License | github.com/farisulhaq/universal-picker */\n';
min = banner + min;

fs.writeFileSync(path.join(__dirname, 'UniversalPicker.min.js'), min, 'utf8');

const origSize = Buffer.byteLength(src, 'utf8');
const minSize = Buffer.byteLength(min, 'utf8');
const ratio = ((1 - minSize / origSize) * 100).toFixed(1);

console.log('Build complete!');
console.log('  Original:  ' + (origSize / 1024).toFixed(1) + ' KB');
console.log('  Minified:  ' + (minSize / 1024).toFixed(1) + ' KB (' + ratio + '% smaller)');
console.log('  Output:    UniversalPicker.min.js');
