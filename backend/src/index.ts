import {WebSocketServer}  from 'ws';

const wss = new WebSocketServer({port: 8080});

let senderSocket : null | WebSocket  = null;
let receiverSocket : null | WebSocket  = null;

wss.on('connection',(ws)=>{
    ws.on('message',(msg:any)=>{
        const newMessage  =  JSON.parse(msg);
        console.log(`Received message => ${newMessage.name}`);
    })
})
//video left at 20:00