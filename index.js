const express = require('express')
const http = require('http')
const app = express()
const WebSocket = require('ws').Server

const port = process.env.PORT || 1234

app.use(express.static(__dirname + '/'))

const server = http.createServer(app)

server.listen(port)

// app.get('/', (req, res) => {
// res.send("it's online")
// })

const wss = new WebSocket({ server: server })

wss.on('connection', function connection(ws, req) {
    console.log('Connecting')
    ws.on('message', function incoming(data) {
        // if message sent is a userIDMessage, meaning it's sent to set the user ID
        const dataObject = JSON.parse(data)
        if (dataObject.identifier) {
            ws.id = dataObject.username
            console.log(ws.id)
        } else {
            // for now, else just means that the message is a chat message and not meant to set the user's ID
            const friendID = dataObject.friendID
            wss.clients.forEach(function each(friend) {
                console.log(friend.id)
                console.log(ws.id)
                if (
                    friend !== ws &&
                    friend.readyState === 1 &&
                    friend.id === friendID
                ) {
                    console.log('FRIEND ID:   ', friend.id)
                    console.log('friendID: ', friendID)
                    console.log('MY ID -------', ws.id)
                    friend.send(data)
                }
            })
        }
    })
})
