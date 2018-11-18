import http from 'http';
import express from 'express';

import routes from './api/routes';
import log from './lib/logger';
import * as apiConfig from './config/api';

const app = express();

app.use(`/api/${apiConfig.VERSION}`, routes());

// Handle wrong requests
/* eslint-disable-next-line no-unused-vars */
app.use((error, req, res, next) => {
  // TODO: format response
  res.status(404).send('Not Found');
});

const server = http.createServer(app);
server.listen(apiConfig.PORT, () => log.debug(`The server is running on port ${apiConfig.PORT}`));
