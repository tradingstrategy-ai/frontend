// my-server.js
import { handler } from '../build/handler.js';
import express from 'express';
import polka from 'polka';

// Works
//const app = express();

// Does not work
const app = polka();

// add a route that lives separately from the SvelteKit app
app.get('/healthcheck', (req, res) => {
  res.end('ok');
});

// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(handler);

app.listen(3000, () => {
  console.log('listening on port 3000');
});

