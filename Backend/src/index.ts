import express from "express"
import WebSocket from "ws"
import http from "http"

const app = express()

const server = http.createServer(app)

const wss = new WebSocket.Server({server})

const clients: WebSocket[] = [];

wss.on("connection",(ws : WebSocket)=> {
    console.log('New Client connected')
    clients.push(ws)
    ws.on("message",(message: string)=> {
        const msg = message.toString();
        clients.forEach((clientsWS)=>{
            if(clientsWS != ws) {
                clientsWS.send(msg)
            }
        })
    })
})

server.listen(3000, () => {
    console.log(`server is running at PORT 3000`)
})
