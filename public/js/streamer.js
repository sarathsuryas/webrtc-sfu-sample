// Ensure turnConfig is properly imported or defined
const socket = io();

let streamKey = ''; // Store the stream key globally
let peer = null; // Store the peer connection globally

window.onload = () => {
  document.getElementById('my-button').onclick = () => {
    getStreamKey();
  }
}

// Get stream key before starting stream
function getStreamKey() {
  streamKey = prompt("Enter stream key");
  if (!streamKey || streamKey.trim() === '') {
    alert("Please enter a valid stream key");
    return;
  }
  
  // Start the stream with the valid key
  startStream();
}

async function startStream() {
  try {
    // Get user media (camera and microphone)
    const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    
    // Display the stream in the video element
    const videoElement = document.getElementById('video');
    videoElement.srcObject = stream;
    videoElement.muted = true; // Mute local video to prevent feedback
    
    // Create the peer connection
    peer = createPeer();
    
    // Add tracks from our stream to the peer connection
    stream.getTracks().forEach(track => peer.addTrack(track, stream));
    
    // Add UI indication that we're live
    document.getElementById('status').textContent = 'Live streaming...';
    
    // Set up socket listeners for the peer connection
    setupSocketListeners();
    
  } catch (error) {
    console.error("Error accessing media devices:", error);
    alert("Could not access camera or microphone. Please check permissions.");
  }
}

function createPeer() {
  // Create a new RTCPeerConnection with the TURN config
  const peer = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.relay.metered.ca:80",
      },
      {
        urls: "turn:global.relay.metered.ca:80",
        username: "836c17083ecba16b626af6f7",
        credential: "j/Du96pT1PjJXgP/",
      },
      {
        urls: "turn:global.relay.metered.ca:80?transport=tcp",
        username: "836c17083ecba16b626af6f7",
        credential: "j/Du96pT1PjJXgP/",
      },
      {
        urls: "turn:global.relay.metered.ca:443",
        username: "836c17083ecba16b626af6f7",
        credential: "j/Du96pT1PjJXgP/",
      },
      {
        urls: "turns:global.relay.metered.ca:443?transport=tcp",
        username: "836c17083ecba16b626af6f7",
        credential: "j/Du96pT1PjJXgP/",
      },
  ],
  });
  
  // Set up event handlers
  peer.onicecandidate = event => {
    if (event.candidate) {
      console.log("New ICE candidate:", event.candidate);
      // You might want to send this to the server if needed
    }
  };
  
  peer.oniceconnectionstatechange = () => {
    console.log("ICE connection state:", peer.iceConnectionState);
  };
  
  peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);
  
  return peer;
}

function setupSocketListeners() {
  // Set up socket event listeners
  socket.on('payload', (response) => {
    console.log("Received SDP answer from server");
    const desc = new RTCSessionDescription(response.sdp);
    peer.setRemoteDescription(desc)
      .then(() => {
        console.log("Remote description set successfully");
      })
      .catch(error => {
        console.error("Error setting remote description:", error);
      });
  });
  
  socket.on('error', (error) => {
    console.error("Socket error:", error);
    alert("Stream error: " + (error.message || "Unknown error"));
  });
}

async function handleNegotiationNeededEvent(peer) {
  try {
    console.log("Creating offer...");
    const offer = await peer.createOffer();
    console.log("Setting local description...");
    await peer.setLocalDescription(offer);
    
    const payload = {
      sdp: peer.localDescription
    };
    
    console.log("Sending offer to server for room:", streamKey);
    socket.emit('start stream', streamKey, payload);
  } catch (error) {
    console.error("Error during negotiation:", error);
    alert("Failed to establish connection. Please try again.");
  }
}