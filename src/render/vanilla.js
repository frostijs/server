import fs from 'fs';
import path from 'path';

export default ({ template }) => {
  const file = path.resolve(template);
  const ENABLE_SW = process.env.NODE_ENV === 'production' || process.env.ENABLE_SW;

  return new Promise((resolve, reject) => {
    // LOAD HTML TEMPLATE FROM DISK
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.error(err); // eslint-disable-line
        return reject(`Error loading ${file}`); // eslint-disable-line
      }

      // RENDER REACT CODE
      let content = data.replace('<!-- SSR_CONTENT -->', '<div id="root">Vanilla...</div>');

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
      }

      return resolve(content);
    });
  });
};
