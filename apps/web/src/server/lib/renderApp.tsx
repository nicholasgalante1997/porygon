import React from 'react';
import { renderToReadableStream } from 'react-dom/server';

import App from '../../App';

export async function renderApp() {
  const stream = await renderToReadableStream(<App />, {
    bootstrapScriptContent: `window.__INITIAL_STATE__ = ${JSON.stringify({
      'x-server-vauth': 'abcdef123456'
    })}`,
    bootstrapModules: ['/src/browser/index.js']
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/html' }
  });
}
