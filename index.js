const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const webrtc = require("wrtc");
const { Server } = require("socket.io");
const config = require("./public/js/config")
let senderStream;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/start-stream',(req,res)=>{
  res.render('streamer.ejs')
})
app.get('/get-stream',(req,res)=>{
  res.render('viewer.ejs')
})
app.post('/broadcast',async(req,res)=>{
 const peer = new webrtc.RTCPeerConnection(config.turnConfig)
 peer.ontrack = (e) =>  handleTrackEvent(e)
 const desc = new webrtc.RTCSessionDescription(req.body.sdp)
 await peer.setRemoteDescription(desc)
 const answer = await peer.createAnswer()
 await peer.setLocalDescription(answer)
 const payload = {
  sdp: peer.localDescription
 }
 res.json(payload)
})

app.post('/consumer',async (req,res)=>{
  const peer = new webrtc.RTCPeerConnection(config.turnConfig);
  const desc = new webrtc.RTCSessionDescription(req.body.sdp);
  await peer.setRemoteDescription(desc);
  senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));
  const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
        sdp: peer.localDescription
    }

    res.json(payload);
})


function handleTrackEvent(event) {
   senderStream = event.streams[0]
}
 
const server = app.listen(5000,()=>{
  console.log('http://localhost:5000/start-stream')
  console.log('http://localhost:5000/get-stream')
})
const io = new Server(server);
io.on("connection", (socket) => {
  console.log("connected")
 socket.on("console",(data)=>{
  console.log(data)
 })
});
