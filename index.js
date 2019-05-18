require("dotenv").config();
const express = require("express");
const cors = require("cors");
const server = express();
const WebSocket = require("ws");

const port = process.env.PORT || 3040;

// these ports are differnet. Need to get ws working with express
server.use(cors());

server.listen(port, () => {
  console.log(`\n***Listening on port ${port}***\n`);
});

const wss = new WebSocket.Server({ server });

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
          friend !== ws &&
          friend.readyState === WebSocket.OPEN &&
          friend.id === friendID
        ) {
          console.log("FRIEND ID:   ", friend.id);
          console.log("friendID: ", friendID);
          console.log("MY ID -------", ws.id);
          friend.send(data);
        }
      });
    }
  });
});
