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
        // if packet is accepting a contact request

        // if packet is checking for online contacts
        else if (dataObject.statusCheck) {
            const contactIDs = dataObject.contactIDs
            const onlineContacts = []
            wss.clients.forEach(contact => {
                if (
                    contactIDs.indexOf(contact.id !== -1) &&
                    contact.id !== ws.id &&
                    dataObject.online
                ) {
                    onlineContacts.push(contact.id)
                    const message = {
                        userIsOnline: true,
                        user: ws.id,
                    }
                    ws.send(JSON.stringify(message))
                }
            })
            // send the client the list of online contacts
            const onlineStatusMessageToClient = {
                updatingOnlineStatus: true,
                onlineContacts,
            }
            wss.clients.forEach(contact => {
                if (contact.id === ws.id) {
                    ws.send(JSON.stringify(onlineStatusMessageToClient))
                }
            })
        }

        // type: 'Accepting Contact Request',
        //  acceptingUser: localStorage.getItem(
        //                        'username',
        //                            ),
        //         requestingUser: from,
        else if (dataObject.type === 'Sending Contact Request') {
            console.table(dataObject)
            const acceptingUser = dataObject.acceptingUser
            wss.clients.forEach(function each(contact) {
                if (
                    contact !== ws &&
                    contact.readyState === 1 &&
                    contact.id === acceptingUser
                ) {
                    console.log('Sending request to: ', contact.id)
                    contact.send(data)
                }
            })
        } else if (dataObject.type === 'Accepting Contact Request') {
            console.table(dataObject)
            const requestingUser = dataObject.requestingUser
            wss.clients.forEach(function each(contact) {
                if (
                    contact !== ws &&
                    contact.readyState === 1 &&
                    contact.id === requestingUser
                ) {
                    console.log('Sending data to: ', contact.id)
                    contact.send(data)
                }
            })
        } else if (dataObject.type === 'Private Message') {
            // for now, else just means that the message is a chat message and not meant to set the user's ID
            const receivingUser = dataObject.receivingUser
            console.table(dataObject)
            wss.clients.forEach(function each(contact) {
                if (
                    contact !== ws &&
                    contact.readyState === 1 &&
                    contact.id === receivingUser
                    // friend.id === friendID
                ) {
                    contact.send(data)
                }
            })
        }
    })
})
