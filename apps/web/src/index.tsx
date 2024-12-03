import { serve } from './server/server';

const server = serve();
console.log(`Listening on http://localhost:${server.port} ...`);
