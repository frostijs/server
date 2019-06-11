require.extensions['.css'] = () => {};
require.extensions['.scss'] = () => {};
require.extensions['.styl'] = () => {};

const BABEL = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '8',
          browsers: '> 5% in US'
        }
      }
    ],
    '@babel/preset-react'
  ],
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-syntax-dynamic-import',
    'transform-postcss',
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@src': './src',
          '@containers': './src/containers',
          '@components': './src/components',
          '@css': './src/css/',
          '@styles': './src/css/',
          '@config': './config',
          '@dist': './.dist',
          '@lib': '../lib',
          '@public': './public',
          '@test': './test'
        }
      }
    ]
  ]
};

module.exports = BABEL;
