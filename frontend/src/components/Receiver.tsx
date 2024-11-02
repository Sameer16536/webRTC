import React, { useEffect, useState } from 'react'

const Receiver = () => {
  const [socket,setSocket] = useState<WebSocket | null>(null);
    const [peerConnection,setPeerConnection] = useState<RTCPeerConnection | null>(null);
    const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  useEffect(()=>{
    const socket = new WebSocket('ws://localhost:8080')
    setSocket(socket)
    socket.onopen =()=>{
      socket.send(JSON.stringify({type:'identify-as-receiver'}))
      startReceiving(socket)
    }
  },[])

  const startReceiving =(socket:WebSocket)=>{
     const video =  document.createElement('video')
     video.playsInline = true
     video.style.width = '100%'
     video.style.maxWidth = '640px'

     const container = document.createElement('div')
     container.appendChild(video)
     document.getElementById('video-container')?.appendChild(container)
     setVideoElement(video)

     const peerConnection = new RTCPeerConnection()
     setPeerConnection(peerConnection)

     peerConnection.onicecandidate = (event) => {
       if (event.candidate) {
         socket.send(JSON.stringify({
           type: 'ice-candidate',
           candidate: event.candidate
         }))
       }
     }

     peerConnection.ontrack = (event)=>{
      console.log('Track received:', event.track.kind)
      if (event.streams && event.streams[0]) {
        video.srcObject = event.streams[0]
      }
     }

     socket.onmessage = (event)=>{
        const message = JSON.parse(event.data)
        console.log('Receiver received:', message)
        if(message.type ==='create-offer'){
          console.log('Processing offer')
          peerConnection.setRemoteDescription(message.sdp)
          .then(()=>peerConnection.createAnswer()
          .then((answer)=>{
            peerConnection.setLocalDescription(answer)
            socket.send(JSON.stringify({type:'create-answer',sdp:answer}))
          })
        )
        }
        else if(message.type ==='ice-candidate'){
          peerConnection.addIceCandidate(message.candidate)
        }
     }
  }

  const handlePlayVideo = () => {
    if (videoElement && videoElement.srcObject) {
      videoElement.play().catch(err => console.error('Error playing video:', err))
    }
  }

  return (
    <div>
      <div id="video-container"></div>
      <button onClick={handlePlayVideo}>Start Video</button>
    </div>
  )
}

export default Receiver