import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
const banner = `/**
 * UniversalPicker.js v${pkg.version}
 * A lightweight, zero-dependency date range picker.
 * https://github.com/farisulhaq/universal-picker
 * @license MIT
 */`;

const replacePlugin = replace({
    preventAssignment: true,
    values: {
        '__VERSION__': pkg.version
    }
});

export default [
    // UMD (full)
    {
        input: 'src/index.js',
        output: {
            file: 'dist/universal-picker.js',
            format: 'umd',
            name: 'UniversalPicker',
            exports: 'default',
            banner: banner
        },
        plugins: [replacePlugin]
    },
    // UMD (minified)
    {
        input: 'src/index.js',
        output: {
            file: 'dist/universal-picker.min.js',
            format: 'umd',
            name: 'UniversalPicker',
            exports: 'default',
            banner: `/*! UniversalPicker.js v${pkg.version} | MIT | github.com/farisulhaq/universal-picker */`
        },
        plugins: [
            replacePlugin,
            terser({
                output: {
                    comments: /^!/
                }
            })
        ]
    },
    // ESM
    {
        input: 'src/index.js',
        output: {
            file: 'dist/universal-picker.esm.js',
            format: 'es',
            banner: banner
        },
        plugins: [replacePlugin]
    }
];
