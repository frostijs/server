import path from 'path';
import { rollup } from '@frosti/config';

import pkg from './package.json';

export default rollup.server({
  input: 'src/express.js',
  output: [
    {
      file: pkg.module,
      format: 'esm'
    },
    {
      file: pkg.main,
      format: 'cjs'
    }
  ],
  ROOT: path.join(__dirname, '../../'),
  library: 'react'
});
