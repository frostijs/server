import fs from 'fs';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

export default ({
  App, Helmet, template, req
}) => {
  const file = path.resolve(template);
  const ENABLE_SW = process.env.NODE_ENV === 'production' || process.env.ENABLE_SW;

  return new Promise((resolve, reject) => {
    // LOAD HTML TEMPLATE FROM DISK
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.error(err); // eslint-disable-line
        return reject(`Error loading ${file}`); // eslint-disable-line
      }

      const context = {};

      // RENDER REACT CODE
      let content = data.replace(
        '<!-- SSR_CONTENT -->',
        `<div id="root">${ReactDOMServer.renderToString(<App url={req.url} context={context} />)}</div>`
      );

      const helmet = Helmet.renderStatic();

      // SET HTML ATTRS
      content = content.replace('<html>', `<html ${helmet.htmlAttributes.toString()}>`);

      // SET BODY ATTRS
      content = content.replace('<body>', `<body ${helmet.bodyAttributes.toString()}>`);

      // SET HEAD DATA
      content = content.replace(
        '<!-- SSR_HEAD -->',
        `<head>
          ${helmet.meta.toString()}
          ${helmet.title.toString()}
          ${helmet.link.toString()}
          ${helmet.style.toString()}
          ${helmet.noscript.toString()}
          ${helmet.script.toString()}
        </head>`
      );

      // SETUP SW
      if (ENABLE_SW) {
        console.log('Injecting Service Worker'); // eslint-disable-line
        content = content.replace(
          '<!-- SERVICE_WORKER -->',
          `<script>
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/service-worker.js').then((registration) => {
                this.serviceWorkerRegistration = registration;
              });
            }
          </script>`
        );
      } else {
        content = content.replace('<!-- SERVICE_WORKER -->', '');
      }

      content = content.replace('(?s)<!--\\[if(.*?)\\[endif\\] *-->', '');

      return resolve(content);
    });
  });
};
