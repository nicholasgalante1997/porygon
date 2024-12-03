import { renderApp } from './renderApp';
import {
  handleStaticFileRequest,
  isRequestForStaticFile
} from './renderStaticFile';

export async function handleRequest(request: Request) {
  const url = new URL(request.url);

  if (['/', '/index.html'].includes(url.pathname)) {
    return renderApp();
  }

  if (await isRequestForStaticFile(request)) {
    console.warn('Request was for static file at path %s', url.pathname);
    return handleStaticFileRequest(request);
  }

  return new Response('Not Found', { status: 404 });
}
