window.onload = () => {
  document.getElementById('my-button').onclick = () => {
    start()
  }
}

function start() {
  const peer = createPeer();
  peer.addTransceiver("video", { direction: "recvonly" })
  peer.addTransceiver("audio", { direction: "recvonly" })

}

function createPeer() {
  const peer = new RTCPeerConnection(turnConfig.iceServers)
  peer.ontrack = handleTrackEvent
  peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);
  return peer
}

async function handleNegotiationNeededEvent(peer) {
  const offer = await peer.createOffer()
  await peer.setLocalDescription(offer)
  const payload = {
    sdp: peer.localDescription
  };
  const { data } = await axios.post('/consumer', payload)
  const desc = new RTCSessionDescription(data.sdp);
  peer.setRemoteDescription(desc).catch(e => console.log(e));

}


function handleTrackEvent(event) {
  document.getElementById("video").srcObject = event.streams[0];
}