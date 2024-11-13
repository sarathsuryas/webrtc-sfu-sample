

const socket = io();
window.onload = () => {
  document.getElementById('my-button').onclick = () => {
      startStream()
  }
}
async function startStream() {
  const stream = await navigator.mediaDevices.getUserMedia({video:true})
  document.getElementById('video').srcObject = stream
   const peer = createPeer()
   stream.getTracks().forEach(track=>peer.addTrack(track,stream))
}


function createPeer() {
  const peer = new RTCPeerConnection(turnConfig.iceServers)
  peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer)
  return peer;
}

async function handleNegotiationNeededEvent(peer) {
  const offer = await peer.createOffer()
  await peer.setLocalDescription(offer)
  const payload = {
    sdp:peer.localDescription
  }
  const {data} = await axios.post('/broadcast',payload)
  const desc = new RTCSessionDescription(data.sdp);
  peer.setRemoteDescription(desc).catch(e => console.error(e))
  //  socket.emit('console',peer.localDescription)
}