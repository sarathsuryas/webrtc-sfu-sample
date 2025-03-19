const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const webrtc = require("wrtc");
const { Server } = require("socket.io");
const config = require("./public/js/config");
console.log(config)
// Stream storage - improved data structure
const streamRegistry = new Map(); // Maps room keys to stream objects

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/start-stream', (req, res) => {
  res.render('streamer.ejs');
});

app.get('/get-stream', (req, res) => {
  res.render('viewer.ejs');
});

const server = app.listen(8000, () => {
  console.log(config)
  console.log('http://localhost:8000/start-stream');
  console.log('http://localhost:8000/get-stream');
});

const io = new Server(server);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  
  // Handle stream initialization
  socket.on("start stream", async (room, body) => {
    try {
      console.log(`Starting stream in room: ${room}`);
      socket.join(room);
      
      // Create and configure the peer connection
      const peer = new webrtc.RTCPeerConnection(config.turnConfig); // Fixed reference to config
      
      // Handle incoming tracks
      peer.ontrack = (event) => {
        console.log(`Track received for stream in room: ${room}`);
        const stream = event.streams[0];
        
        // Store the stream in our registry
        streamRegistry.set(room, stream);
        console.log(`Stream registered for room: ${room}`);
      };
      
      // Set up the connection
      const desc = new webrtc.RTCSessionDescription(body.sdp);
      await peer.setRemoteDescription(desc);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      
      // Send the answer back to the client
      const payload = {
        sdp: peer.localDescription
      };
      socket.emit('payload', payload);
      console.log(`Stream setup completed for room: ${room}`);
    } catch (error) {
      console.error("Error in start stream:", error);
      socket.emit('error', { message: "Failed to start stream", details: error.message });
    }
  });
  
  // Handle viewer connections
  socket.on('watch live', async (room, body) => {
    try {
      // Check if the room exists
      if (!io.of("/").adapter.rooms.has(room)) {
        console.log(`Invalid stream key requested: ${room}`);
        socket.emit('invalid', `Stream key ${room} is invalid or stream not active`);
        return;
      }
      
      // Get the stream for this room
      const stream = streamRegistry.get(room);
      if (!stream) {
        console.log(`Stream not found for room: ${room}`);
        socket.emit('invalid', `Stream for ${room} exists but media not available yet`);
        return;
      }
      
      console.log(`Viewer joining room: ${room}`);
      socket.join(room);
      
      // Create and configure the peer connection for the viewer
      const peer = new webrtc.RTCPeerConnection(config.turnConfig); // Fixed reference to config
      const desc = new webrtc.RTCSessionDescription(body.sdp);
      await peer.setRemoteDescription(desc);
      
      // Add all tracks from the stream to the peer connection
      stream.getTracks().forEach(track => peer.addTrack(track, stream)); // Fixed reference to stream
      
      // Create and send the answer
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      const payload = {
        sdp: peer.localDescription
      };
      
      // Send the result to the viewer
      socket.emit('result', payload);
      console.log(`Viewer connected to stream in room: ${room}`);
    } catch (error) {
      console.error("Error in watch live:", error);
      socket.emit('error', { message: "Failed to connect to stream", details: error.message });
    }
  });
  
  // Handle disconnections
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    // Could add cleanup logic here if needed
  });
});

// Global error handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});