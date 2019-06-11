/* eslint-disable no-console */
import chokidar from 'chokidar';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import spdy from 'spdy';
import fs from 'fs';
import os from 'os';
import path from 'path';
import redirect from 'redirect-https';
import 'colors';

import render from './render/index';

const server = ({
  // REQUIRED
  root,
  // render,

  // REQUIRED FOR REACT
  App,
  Helmet,

  // OPTIONAL
  library,
  port,
  template
}) => {
  const ROOT = root;
  const ENV = process.env.NODE_ENV || 'development';
  const HOST = process.env.HOST || 'local';
  const PORT = process.env.PORT || port || 1981;
  const IS_PROD = ENV === 'production';

  const TEMPLATE = `${ROOT}${template}`;

  // DEFINE VARS
  const app = express();
  const watcher = chokidar.watch(`${ROOT}./src`);
  const certDirectory = path.join(os.homedir(), '.nodecert');

  const DIR = {
    common: `${ROOT}/src/common/`,
    public: `${ROOT}/public`,
    dist: `${ROOT}/.dist`,
    functions: `${ROOT}/.functions`,
    src: `${ROOT}/src`,
    root: `${ROOT}/`
  };

  app.use(compression());
  app.use(cors());

  // UPDATE SERVER WHEN FILES CHANGE
  if (!IS_PROD) {
    watcher.on('ready', () => {
      watcher.on('all', () => {
        Object.keys(require.cache).forEach((id) => {
          /* eslint-disable no-useless-escape */
          if (/[\/\\]src[\/\\]/.test(id) || /[\/\\].dist[\/\\]/.test(id)) {
            delete require.cache[id];
          }
        });
      });
    });
  }

  const staticDirs = {
    dist: DIR.dist,
    src: DIR.src
  };

  app.use(express.static(staticDirs.dist));
  app.use(express.static(staticDirs.dist));

  // RENDER REACT APP
  app.get('/*', (req, res) => {
    try {
      const streamCSS = res.push(`${DIR.dist}/app.css`, {
        status: 200, // optional
        method: 'GET', // optional
        request: {
          accept: '*/*'
        },
        response: {
          'content-type': 'text/css'
        }
      });

      streamCSS.end();

      const streamJS = res.push(`${DIR.dist}/app.js`, {
        status: 200, // optional
        method: 'GET', // optional
        request: {
          accept: '*/*'
        },
        response: {
          'content-type': 'application/javascript'
        }
      });

      streamJS.end();
    } catch (err) {
      // SERVER PUSH NOT SUPPORTED
    }

    render({
      App,
      Helmet,
      template: TEMPLATE,
      library,
      req
    })
      .then((html) => {
        res.send(html);
      })
      .catch(() => {
        console.log('Error rendering template');
        res.send('Doh!');
      });
  });

  let keys = {};

  if (HOST === 'local' || HOST === 'ssr') {
    app.locals.pretty = true;
    keys = {
      key: fs.readFileSync(path.join(certDirectory, 'localhost-key.pem')),
      cert: fs.readFileSync(path.join(certDirectory, 'localhost.pem'))
    };

    app.use(
      '/',
      redirect({
        body: '<!-- Hello there developer! Please use HTTPS instead -->'
      })
    );
  } else if (HOST === 'firebase') {
    keys = {
      key: __dirname + '/key.pem', // eslint-disable-line
      cert: __dirname + '/cert.pem' // eslint-disable-line
    };
  } else {
    keys = false;
  }

  let initServer;

  if (keys) {
    initServer = (SERVER_PORT) => {
      spdy.createServer(keys, app).listen(SERVER_PORT, (error) => {
        if (error) {
          console.error(error); // eslint-disable-line
          return process.exit(1);
        }

        const host = `https://localhost:${SERVER_PORT}`;

        return console.log(`\n Node server started at ${host}\n`); // eslint-disable-line
      });
    };
  } else {
    initServer = (SERVER_PORT) => {
      app.listen(SERVER_PORT, () => {
        const host = `http://localhost:${SERVER_PORT}`;
        console.log(`\n Node server started at ${host}\n`);
      });
    };
  }

  if (HOST !== 'firebase') {
    return initServer(PORT);
  }
  return app;
};

export default server;
