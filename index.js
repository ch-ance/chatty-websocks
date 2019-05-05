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

wss.on("connection", function connection(ws, req) {
  console.log("Connecting");
  ws.on("message", function incoming(data) {
    console.log(`Data is type: ${typeof data}`);
    if (data.includes("poop")) {
      console.log(parseInt(data));
      ws.id = parseInt(data);
      console.log(ws.id);
    } else {
      const dataCopy = data;
      const friendID = JSON.parse(dataCopy).friendID;
      wss.clients.forEach(function each(friend) {
        if (
          friend !== ws &&
          friend.readyState === WebSocket.OPEN &&
          parseInt(friend.id) == parseInt(friendID)
        ) {
          console.log("Sending");
          console.log("FRIEND ID:   ", friend.id);
          console.log("MY ID -------", ws.id);
          console.log("this should work: ", friendID);
          friend.send(data);
        }
      });
    }
  });
});
