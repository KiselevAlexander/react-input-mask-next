import typescript from '@rollup/plugin-typescript';
import dts from "rollup-plugin-dts";

const config = [
    {
        input: 'dist/src/index.js',
        output: {
            file: 'dist/cjs/index.js',
            format: 'cjs',
            sourcemap: true,

        },
        external: ['axios', 'os', 'url'],
        plugins: [typescript()]
    },
    {
        input: 'dist/src/index.js',
        output: {
            file: 'dist/esm/index.js',
            format: 'es',
            sourcemap: true,

        },
        external: ['axios', 'os', 'url'],
        plugins: [typescript()]
    },
    {
        input: 'dist/src/index.d.ts',
        output: {
            file: 'dist/esm/index.d.ts',
            format: 'es'
        },
        plugins: [dts()]
    },
    {
        input: 'dist/src/index.d.ts',
        output: {
            file: 'dist/cjs/index.d.ts',
            format: 'es'
        },
        plugins: [dts()]
    }
];
export default config;