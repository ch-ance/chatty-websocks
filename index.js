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
    // if message sent is a userIDMessage, meaning it's sent to set the user ID
    const dataObject = JSON.parse(data);
    if (dataObject.identifier) {
      ws.id = dataObject.userID;
      console.log(ws.id);
    } else {
      // for now, else just means that the message is a chat message and not meant to set the user's ID
      const friendID = dataObject.friendID;
      wss.clients.forEach(function each(friend) {
        if (
          // friend !== ws &&
          friend.readyState === WebSocket.OPEN &&
          parseInt(friend.id) == parseInt(friendID)
        ) {
          console.log("FRIEND ID:   ", friend.id);
          console.log("MY ID -------", ws.id);
          friend.send(data);
        }
      });
    }
  });
});
