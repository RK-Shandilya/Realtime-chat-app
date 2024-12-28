"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = __importDefault(require("ws"));
const http_1 = __importDefault(require("http"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.default.Server({ server });
const clients = [];
wss.on("connection", (ws) => {
    console.log('New Client connected');
    clients.push(ws);
    ws.on("message", (message) => {
        const msg = message.toString();
        clients.forEach((clientsWS) => {
            if (clientsWS != ws) {
                clientsWS.send(msg);
            }
        });
    });
});
server.listen(3000, () => {
    console.log(`server is running at PORT 3000`);
});
