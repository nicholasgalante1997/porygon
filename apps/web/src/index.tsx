import React from 'react';
import { renderToReadableStream } from 'react-dom/server';

import App from './App';

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    console.log(url);
    const stream = await renderToReadableStream(
      <App />,
    );
    return new Response(stream, {
      headers: { "Content-Type": "text/html" },
    });
  }
});

console.log(`Listening on http://localhost:${server.port} ...`);
