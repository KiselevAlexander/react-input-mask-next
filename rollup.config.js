import typescript from '@rollup/plugin-typescript';
import dts from "rollup-plugin-dts";

const config = [
    {
        input: 'dist/src/index.js',
        output: {
            file: 'dist/lib/input-mask-next.js',
            format: 'cjs',
            sourcemap: true,

        },
        external: ['axios', 'os', 'url'],
        plugins: [typescript()]
    },
    {
        input: 'dist/src/index.js',
        output: {
            file: 'dist/lib/input-mask-next.mjs',
            format: 'es',
            sourcemap: true,

        },
        external: ['axios', 'os', 'url'],
        plugins: [typescript()]
    },
    {
        input: 'dist/src/index.d.ts',
        output: {
            file: 'dist/lib/input-mask-next.d.ts',
            format: 'es'
        },
        plugins: [dts()]
    }
];
export default config;