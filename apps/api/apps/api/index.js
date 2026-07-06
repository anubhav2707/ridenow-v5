'use strict';

// RideNow v5 API service entrypoint (minimal stub).
const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ service: 'ridenow-api', version: '5.0.0', status: 'ok' }));
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`ridenow-api listening on port ${PORT}`);
  });
}

module.exports = server;
