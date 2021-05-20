const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const app = express();
app.use(express.static(path.join(__dirname, '../../frontend/build')));

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
server.listen(PORT);
console.log(`server listening on port ${PORT}`);

const ACKNOWLEDGE = JSON.stringify({
  type: 'ACKNOWLEDGE',
  content: '',
});

const wsServer = new WebSocket.Server({ server: server });
wsServer.on('connection', (client) => {
  console.log('new websocket connection');
  console.log(`there are now ${wsServer.clients.size} clients connected`);

  client.on('message', (data) => {
    wsServer.clients.forEach((recipient) => {
      if (client !== recipient && recipient.readyState === WebSocket.OPEN) {
        recipient.send(data);
      }
    });
    client.send(ACKNOWLEDGE);
    console.log('websocket connection received message');
  });

  client.on('close', () => {
    console.log('websocket connection closed');
    console.log(`there are now ${wsServer.clients.size} clients connected`);
  });
});
