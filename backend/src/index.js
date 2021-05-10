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
wsServer.on('connection', (socket) => {
  console.log('new websocket connection');
  console.log(`there are now ${wsServer.clients.size} clients connected`);

  socket.on('message', (data) => {
    wsServer.clients.forEach((socket) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(data)
      }
    });
    socket.send(ACKNOWLEDGE);
    console.log('websocket connection received message');
  });

  socket.on('close', () => {
    console.log('websocket connection closed');
    console.log(`there are now ${wsServer.clients.size} clients connected`);
  });
});
