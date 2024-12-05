

const socket = io();
var pcConfig = turnConfig;

window.onload = () => {
  document.getElementById('my-button').onclick = () => {
      startStream()
  }
}
async function startStream() {

  const stream = await navigator.mediaDevices.getUserMedia({video:true,audio:true})
  document.getElementById('video').srcObject = stream
   const peer = createPeer()
   stream.getTracks().forEach(track=>peer.addTrack(track,stream))
}

function createPeer() {
  const peer = new RTCPeerConnection(pcConfig)
  peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer)
  return peer;
}

async function handleNegotiationNeededEvent(peer) {
  const offer = await peer.createOffer()
  await peer.setLocalDescription(offer)
  const payload = {
    sdp:peer.localDescription
  }
  const room = prompt("enter stream key")
  socket.emit('start stream',room,payload) 
  socket.on('payload',(response)=>{
    const desc = new RTCSessionDescription(response.sdp);
    peer.setRemoteDescription(desc).catch(e => console.error(e))
  })
  // const { data } = await axios.post('/broadcast',payload)
 
  
  //  socket.emit('console',peer.localDescription)
}