# Frosti Server

Express powered Node server powering Frosti server-side-rendering fro apps created with [frosti cli](https://github.com/frostijs/cli).

## Usage

You should rarely need to interact with this directly, it will be automaticalyl imported and configured for you when you use the [frosti cli](https://github.com/frostijs/cli) to create a new app. However if you would like to use it from scratch, it's pretty straight-forward:

#### React

```
import path from 'path';
import server from '@frosti/server';
import { Helmet } from 'react-helmet';

// Base React component for Server
import Server from './render/Server';

server({
  App: Server,
  library: 'react',
  Helmet,
  root: path.join(__dirname, '../'),
  template: '/src/template.html' // Relative to ROOT Dir
});

```

#### Vanilla JS

```
import path from 'path';
import server from '@frosti/server';
import config from '../config/app';

server({
  template: '/src/template.html',
  root: path.join(__dirname, '../'),
  config
});

```
