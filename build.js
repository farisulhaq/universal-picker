/**
 * Build script to create minified version.
 * No external dependencies - safe minification that preserves strings and identifiers.
 */
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'UniversalPicker.js'), 'utf8');

/**
 * Tokenize source into strings (preserved) and code (minified).
 * This ensures we never modify content inside quotes.
 */
function tokenize(source) {
    const tokens = [];
    let i = 0;
    const len = source.length;

    while (i < len) {
        const ch = source[i];

        // Single-line comment
        if (ch === '/' && source[i + 1] === '/') {
            // Check it's not a URL (://)
            if (i > 0 && source[i - 1] === ':') {
                // Part of URL, treat as code
                tokens.push({ type: 'code', value: '//' });
                i += 2;
                continue;
            }
            let end = source.indexOf('\n', i);
            if (end === -1) end = len;
            // Discard comment
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
                if (source[end] === '\\') end++;
                end++;
            }
            end++;
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

        // Regular code - collect until next string/comment
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

/**
 * Safely minify code (not strings).
 * Only collapse whitespace - do NOT try to remove spaces around keywords.
 * This is safe because we just reduce multiple spaces/newlines to single space.
 */
function minifyCode(code) {
    // Replace all whitespace sequences (spaces, tabs, newlines) with single space
    let result = code.replace(/\s+/g, ' ');

    // Remove space before these characters
    result = result.replace(/ ([{}()\[\];,])/g, '$1');

    // Remove space after these characters
    result = result.replace(/([{}()\[\];,]) /g, '$1');

    // Remove space around = but NOT around === or !== or == or !=  or <= or >= or =>
    result = result.replace(/ ?(===|!==|==|!=|<=|>=|=>|&&|\|\|) ?/g, '$1');

    // Remove space around simple assignment and colon
    result = result.replace(/ ?([=:]) ?/g, function(match, op, offset) {
        // Don't collapse === !== == != <= >= =>
        const before = result[offset - 1];
        const after = result[offset + op.length + (match.length - op.length)];
        if (op === '=' && (before === '=' || before === '!' || before === '<' || before === '>')) return match;
        if (op === '=' && result[offset + 1] === '=' ) return match;
        return op;
    });

    return result;
}

// Tokenize
const tokens = tokenize(src);

// Minify only code tokens, leave strings untouched
let min = tokens.map(function(t) {
    if (t.type === 'code') {
        return minifyCode(t.value);
    }
    return t.value;
}).join('');

// Final cleanup: collapse remaining multi-spaces
min = min.replace(/  +/g, ' ').trim();

// Add banner
const banner = '/*! UniversalPicker.js v2.0.3 | MIT License | github.com/farisulhaq/universal-picker */\n';
min = banner + min;

fs.writeFileSync(path.join(__dirname, 'UniversalPicker.min.js'), min, 'utf8');

const origSize = Buffer.byteLength(src, 'utf8');
const minSize = Buffer.byteLength(min, 'utf8');
const ratio = ((1 - minSize / origSize) * 100).toFixed(1);

console.log('Build complete!');
console.log('  Original:  ' + (origSize / 1024).toFixed(1) + ' KB');
console.log('  Minified:  ' + (minSize / 1024).toFixed(1) + ' KB (' + ratio + '% smaller)');
console.log('  Output:    UniversalPicker.min.js');
