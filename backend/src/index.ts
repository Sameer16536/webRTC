import {WebSocketServer, WebSocket}  from 'ws';

const wss = new WebSocketServer({port: 8080});

let senderSocket : null | WebSocket  = null;
let receiverSocket : null | WebSocket  = null;

wss.on('connection',(ws)=>{
    ws.on('message',(msg:any)=>{
        const message  =  JSON.parse(msg);
        console.log(`Received message => ${message.name}`);

        if(message.type === 'identify-as-sender'){
            senderSocket = ws;
        }
        else if(message.type === 'identify-as-receiver'){
            receiverSocket = ws;
        }
        else if(message.type === 'create-offer'){
            receiverSocket?.send(JSON.stringify({type:'offer',sdp:message.offer}));
        }
        else if(message.type === 'create-answer'){
            senderSocket?.send(JSON.stringify({type:'answer',sdp:message.answer}));
        }
        else if(message.type === 'ice-candidate'){
            if(ws ===senderSocket){
                receiverSocket?.send((JSON.stringify({type:'ice-candidate',candidate:message.candidate})));
            }
            else if(ws === receiverSocket){
                senderSocket?.send((JSON.stringify({type:'ice-candidate',candidate:message.candidate})));
            }
        }
    })
})
