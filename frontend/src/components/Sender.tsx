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

        const pc = new RTCPeerConnection()
        setPeerConnection(pc)

        socket.onmessage=async(event)=>{
            const message = JSON.parse(event.data)
            console.log('Sender received:', message)
            if(message.type ==='create-answer'){
                await pc.setRemoteDescription(message.sdp)
            }
            else if(message.type === 'ice-candidate'){
                pc.addIceCandidate(message.candidate)
            }
        }

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

    const getCameraStreamAndSend = async (pc: RTCPeerConnection) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true,
                audio: false // Add audio if needed
            })
            
            // Add tracks to peer connection
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream) // Make sure to pass the stream as second parameter
            })

            // Optional: Show local video
            const video = document.createElement('video')
            video.srcObject = stream
            video.autoplay = true
            video.playsInline = true
            video.muted = true // Mute local video
            document.getElementById('local-video-container')?.appendChild(video)
        } catch (err) {
            console.error('Error accessing media devices:', err)
        }
    }

    return (
        <div>
            <div id="local-video-container"></div>
            <button onClick={initiateConnection}>Send</button>
        </div>
    )
}

export default Sender