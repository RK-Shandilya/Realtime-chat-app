import express from 'express';
import WebSocket from 'ws';
import http from 'http';
import { UserManager } from './UserManager';
import { InMemoryStore } from './store/InMemoryStore';
import { IncomingMessage, SupportedMessage } from "./messages/IncomingMessage";
import { OutgoingMessage, SupportedMessage as OutgoingSupportedMessages } from "./messages/outgoingMessages";

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const userManager = new UserManager();
const store = new InMemoryStore();

function originIsAllowed(origin: string): boolean {
    return true;
}

wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
    const origin = req.headers.origin || '';

    if (!originIsAllowed(origin)) {
        ws.close(1008, 'Origin not allowed');
        console.log((new Date()) + ' Connection from origin ' + origin + ' rejected.');
        return;
    }

    console.log((new Date()) + ' Connection accepted.');

    ws.on('message', (message: WebSocket.Data) => {
        // Todo add rate limiting logic here
        console.log('received: %s', message);
        if (typeof message === 'string') {
            try {
                messageHandler(ws, JSON.parse(message));
            } catch (e) {
                console.error(e);
            }
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

server.listen(3000, () => {
    console.log(`server is running at PORT 3000`);
});

function messageHandler(ws: WebSocket, message: IncomingMessage) {
    if (message.type === SupportedMessage.JoinRoom) {
        const payload = message.payload;
        userManager.addUser(payload.name, payload.userId, payload.roomId, ws);
    }

    if (message.type === SupportedMessage.SendMessage) {
        const payload = message.payload;
        const user = userManager.getUser(payload.roomId, payload.userId);

        if (!user) {
            console.error("User not found in the db");
            return;
        }
        let chat = store.addChat(payload.userId, user.name, payload.roomId, payload.message);
        if (chat === undefined) {
            return;
        }

        const outgoingPayload: OutgoingMessage= {
            type: OutgoingSupportedMessages.AddChat,
            payload: {
                chatId: chat.id,
                roomId: payload.roomId,
                message: payload.message,
                name: user.name,
                upvotes: 0
            }
        }
        userManager.broadcast(payload.roomId, payload.userId, outgoingPayload);
    }
    
    if (message.type === SupportedMessage.UpvoteMessage) {
        const payload = message.payload;
        const chat = store.upvote(payload.userId, payload.roomId, payload.chatId);
        console.log("inside upvote")
        if (!chat) {
            return;
        }
        console.log("inside upvote 2")

        const outgoingPayload: OutgoingMessage= {
            type: OutgoingSupportedMessages.UpdateChat,
            payload: {
                chatId: payload.chatId,
                roomId: payload.roomId,
                upvotes: chat.upvotes.length
            }
        }

        console.log("inside upvote 3")
        userManager.broadcast(payload.roomId, payload.userId, outgoingPayload);
    }
}
