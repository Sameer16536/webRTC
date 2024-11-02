import React, { useEffect, useState } from 'react'

const Sender = () => {
    const [socket,setSocket] = useState<WebSocket | null>(null);
    const [peerConnection,setPeerConnection] = useState<RTCPeerConnection | null>(null);

    useEffect(()=>{
        const socket = new WebSocket('ws://localhost:8080');
        setSocket(socket);
        
        socket.onopen = ()=>{
            console.log('Connected to server');
            socket.send(JSON.stringify({type:'identify-as-sender'}));
        }
    },[])

    const initiateConnection = ()=>{
        if(!socket){
            console.log('Socket not connected');
            alert('Socket not connected');
            return;
        }
        socket.onmessage=async(event)=>{
            const message = JSON.parse(event.data)
            console.log(message)
            if(message.type ==='create-answer'){
                await peerConnection?.setRemoteDescription(message.sdp)
            }
            else if(message.type === 'ice-candidate'){
                peerConnection?.addIceCandidate(message.candidate)
            }
        }

        const pc = new RTCPeerConnection()
        setPeerConnection(pc)

        pc.onicecandidate = (event)=>{
            if(event.candidate){
                socket?.send(JSON.stringify({type:'ice-candidate',candidate:event.candidate}))
            }
        }

        pc.onnegotiationneeded = async()=>{
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            socket?.send(JSON.stringify({type:'create-offer',sdp:pc.localDescription}))
        }
        getCameraStreamAndSend(pc)
    }

    const getCameraStreamAndSend=(pc:RTCPeerConnection)=>{
        navigator.mediaDevices.getUserMedia({video:true})
            .then((stream)=>{
                const video = document.createElement('video')
                video.srcObject = stream
                video.play()
                //Change later to proper 
                document.body.appendChild(video)
                stream.getTracks().forEach((track)=>{
                    pc?.addTrack(track)
                })
            })

    }
  return (
    <div>
        Sender
        <button onClick={initiateConnection}>Send</button>
    </div>
  )
}

export default Sender