import {WebSocketServer, WebSocket}  from 'ws';

const wss = new WebSocketServer({port: 8080});

let senderSocket : null | WebSocket  = null;
let receiverSocket : null | WebSocket  = null;

wss.on('connection',(ws)=>{
    ws.on('message',(msg:any)=>{
        const message  =  JSON.parse(msg);
        console.log(`Received message => ${message.name}`);

        if(message.type === 'identify-as-sender'){
            console.log('Sender connected');
            senderSocket = ws;
        }
        else if(message.type === 'identify-as-receiver'){
            console.log('Receiver connected');
            receiverSocket = ws;
        }
        else if(message.type === 'create-offer'){
            console.log('Sender sending offer');
            receiverSocket?.send(JSON.stringify({type:'create-offer',sdp:message.sdp}));
        }
        else if(message.type === 'create-answer'){
            console.log('Sender sending answer');
            senderSocket?.send(JSON.stringify({type:'create-answer',sdp:message.sdp}));
        }
        else if(message.type === 'ice-candidate'){
            console.log('Sending ice candidate');
            if(ws ===senderSocket){
                receiverSocket?.send((JSON.stringify({type:'ice-candidate',candidate:message.candidate})));
            }
            else if(ws === receiverSocket) {
                console.log('Receiver sending ice candidate');
                senderSocket?.send((JSON.stringify({type:'ice-candidate',candidate:message.candidate})));
            }
        }
    })
})
