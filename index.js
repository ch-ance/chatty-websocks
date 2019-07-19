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
            console.log('setting id', dataObject)
            ws.id = dataObject.username
            console.log(ws.id)
        }
        // if packet is a SENDING CONTACT REQUEST
        else if (dataObject.sendingContactRequest) {
            const friendID = dataObject.friendID
            wss.clients.forEach(contact => {
                if (contact.id === friendID) {
                    // console.table(data)
                }
            })
        }
        // if packet is checking for online contacts
        else if (dataObject.statusCheck) {
            const contactIDs = dataObject.contactIDs
            const onlineContacts = []
            wss.clients.forEach(contact => {
                console.log('hey contact, ', contactIDs)
                if (
                    contactIDs.indexOf(contact.id !== -1) &&
                    contact.id !== ws.id
                ) {
                    console.log(`${contact.id} is online`)
                    onlineContacts.push(contact.id)
                }
            })
            // send the client the list of online contacts
            const onlineStatusMessageToClient = {
                updatingOnlineStatus: true,
                onlineContacts,
            }
            wss.clients.forEach(contact => {
                if (contact.id === ws.id) {
                    console.log('Sending it: ', onlineStatusMessageToClient)
                    ws.send(JSON.stringify(onlineStatusMessageToClient))
                }
            })
            console.log('Online contacts: ', onlineContacts)
        } else {
            // for now, else just means that the message is a chat message and not meant to set the user's ID
            const friendID = dataObject.friendID
            wss.clients.forEach(function each(friend) {
                if (
                    friend !== ws &&
                    friend.readyState === 1 &&
                    friend.id === friendID
                ) {
                    friend.send(data)
                }
            })
        }
    })
})
