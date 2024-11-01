"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let senderSocket = null;
let receiverSocket = null;
wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        const newMessage = JSON.parse(msg);
        console.log(`Received message => ${newMessage.name}`);
    });
});
