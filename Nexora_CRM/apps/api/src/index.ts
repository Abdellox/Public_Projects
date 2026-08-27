import './load-env';
import { serve } from '@hono/node-server';
import { createApp } from './app';

const port = Number(process.env.API_PORT ?? 4000);

const server = serve({ fetch: createApp().fetch, port }, (info) => {
  console.log(`▲ Nexora API listening on http://localhost:${info.port}`);
});

function shutdown() {
  console.log('Shutting down…');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
