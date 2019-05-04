const express = require("express");
const app = express();
const WebSocket = require("ws");

const wss = new WebSocket.Server({ app });

app.get("/", (req, res) => {
  res.send("it's online");
});

wss.on("connection", ws => {
  ws.on("message", message => {
    console.log(`Recieved ${message}`);
  });

  ws.send("something");
});

const port = 8080;
app.listen(port, () => {
  console.log(`\n***Listening on port ${port}***\n`);
});
