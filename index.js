const express = require("express");
const server = express();
const WebSocket = require("ws");

const port = 8080;

server.listen(port, () => {
  console.log(`\n***Listening on port ${port}***\n`);
});

const wss = new WebSocket.Server({ port: 3030 });

server.get("/", (req, res) => {
  res.send("it's online");
});

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(data) {
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});
