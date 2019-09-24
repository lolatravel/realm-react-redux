import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';

const env = process.env.NODE_ENV;

const config = {
    input: 'src/index.js',
    external: [
        'react',
        'redux',
        'realm'
    ],
    output: {
        globals: {
            react: 'React',
            redux: 'Redux',
            realm: 'Realm'
        },
        format: 'umd',
        name: 'RealmReactRedux'
    },
    plugins: [
        babel({
            exclude: '**/node_modules/**'
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify(env)
        }),
        nodeResolve(),
        commonjs({
            include: 'node_modules/**',
            namedExports: {
                'node_modules/react-is/index.js': ['isValidElementType', 'isContextConsumer']
            }
        })
    ]
};

if (env === 'production') {
    config.plugins.push(
        uglify({
            compress: {
                pure_getters: true,
                unsafe: true,
                unsafe_comps: true
            }
        })
    );
}

export default config;
