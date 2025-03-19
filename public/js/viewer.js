// Ensure turnConfig is properly imported or defined
const socket = io();

let streamKey = ''; // Store the stream key globally
let peer = null; // Store the peer connection globally

window.onload = () => {
  document.getElementById('my-button').onclick = () => {
    getStreamKey();
  }
  
  // Set up socket listeners
  setupSocketListeners();
}

// Get stream key before connecting
function getStreamKey() {
  streamKey = prompt("Enter stream key to join");
  if (!streamKey || streamKey.trim() === '') {
    alert("Please enter a valid stream key");
    return;
  }
  
  // Start the connection with the valid key
  start();
}

function start() {
  try {
    // Create a new peer connection
    peer = createPeer();
    
    // Add transceivers for receiving video and audio only
    peer.addTransceiver("video", { direction: "recvonly" });
    peer.addTransceiver("audio", { direction: "recvonly" });
    
    // Update status
    document.getElementById('status').textContent = 'Connecting to stream...';
    
  } catch (error) {
    console.error("Error creating peer connection:", error);
    alert("Failed to create connection. Please try again.");
  }
}

function createPeer() {
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
  peer.ontrack = handleTrackEvent;
  peer.onicecandidate = event => {
    if (event.candidate) {
      console.log("New ICE candidate:", event.candidate);
      // You might want to send this to the server if needed
    }
  };
  
  peer.oniceconnectionstatechange = () => {
    console.log("ICE connection state:", peer.iceConnectionState);
    if (peer.iceConnectionState === 'disconnected' || 
        peer.iceConnectionState === 'failed' || 
        peer.iceConnectionState === 'closed') {
      document.getElementById('status').textContent = 'Stream disconnected';
    }
  };
  
  peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);
  
  return peer;
}

function setupSocketListeners() {
  // Set up socket event listeners
  socket.on('result', (data) => {
    console.log("Received SDP answer from server:", data);
    
    if (!peer) {
      console.error("Received result but peer connection doesn't exist");
      return;
    }
    
    const desc = new RTCSessionDescription(data.sdp);
    peer.setRemoteDescription(desc)
      .then(() => {
        console.log("Remote description set successfully");
        document.getElementById('status').textContent = 'Connected to stream';
      })
      .catch(error => {
        console.error("Error setting remote description:", error);
        document.getElementById('status').textContent = 'Connection failed';
      });
  });
  
  socket.on('invalid', (message) => {
    console.error("Invalid stream key:", message);
    alert(message);
    document.getElementById('status').textContent = 'Invalid stream key';
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
    socket.emit('watch live', streamKey, payload);
  } catch (error) {
    console.error("Error during negotiation:", error);
    alert("Failed to establish connection. Please try again.");
  }
}

function handleTrackEvent(event) {
  console.log("Track received:", event.track.kind);
  document.getElementById("video").srcObject = event.streams[0];
  document.getElementById('status').textContent = 'Stream connected';
}