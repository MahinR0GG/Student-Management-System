/***************************************************************************************************
 * Angular Universal Express Server
 */

import 'zone.js/node';
import express from 'express';
import { join } from 'path';

import { AppServerModule } from './main.server';
import { ngExpressEngine } from '@nguniversal/express-engine';
import bootstrap from './main.server';

const app = express();

const DIST_FOLDER = join(process.cwd(), 'dist/client/browser');

// Set the engine
app.engine(
  'html',
  ngExpressEngine({
    bootstrap,
  }) as any
);

app.set('view engine', 'html');
app.set('views', DIST_FOLDER);

// Serve static files
app.get(
  '*.*',
  express.static(DIST_FOLDER, {
    maxAge: '1y',
  })
);

// Handle all routes -> Angular app
app.get('*', (req, res) => {
  res.render('index', { req });
});

// Start the server
const port = process.env['PORT'] || 4000;
app.listen(port, () => {
  console.log(`✅ Angular Universal running on http://localhost:${port}`);
});

export * from './main.server';
