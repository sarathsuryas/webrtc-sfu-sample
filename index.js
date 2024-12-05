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
// app.post('/broadcast',async(req,res)=>{
 
//  res.json(payload)
// })

// app.post('/consumer',async (req,res)=>{
//   const peer = new webrtc.RTCPeerConnection(config.turnConfig);
//   const desc = new webrtc.RTCSessionDescription(req.body.sdp);
//   await peer.setRemoteDescription(desc);
//   senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));
//   const answer = await peer.createAnswer();
//     await peer.setLocalDescription(answer);
//     const payload = {
//         sdp: peer.localDescription
//     }

//     res.json(payload);
// })  
const server = app.listen(8000,()=>{
  console.log('http://localhost:8000/start-stream')
  console.log('http://localhost:8000/get-stream')
})

const io = new Server(server);
const streamArray = []
var count = -1
var streamKey = ''
function handleTrackEvent(event) {
  count++
  console.log(count)
  console.log(streamKey,"key")
 senderStream =  event.streams[0]
 streamArray.push({stream:event.streams[0],key:streamKey})
 
}
console.log(count,'top')
try {
  io.on("connection", (socket) => {
    console.log("connected")
   socket.on("start stream",async(room,body)=>{
     socket.join(room)
   streamKey = room
     const peer = new webrtc.RTCPeerConnection(turnConfig)
     peer.ontrack = (e) =>  handleTrackEvent(e)
     const desc = new webrtc.RTCSessionDescription(body.sdp)
     await peer.setRemoteDescription(desc)
     const answer = await peer.createAnswer()
     await peer.setLocalDescription(answer)
     const payload = {
      sdp: peer.localDescription
     }
     socket.emit('payload',payload)
     console.log('joined')
   })
   socket.on('watch live',async(room,body)=>{
     if(!io.of("/").adapter.rooms.has(room)) {
       socket.emit('invalid',`stream key ${room} is invalid`)
       return
     } 
     console.log(streamArray)
     console.log('count',count)
     let stream
     let testCount = 0
     for(let i = 0; i < streamArray.length; i++) {
        if(room === streamArray[i].key) {
          testCount++
        }
        if(testCount === 2) {
           stream = streamArray[i].stream
           console.log("break",i)
           console.log("my stream key and stream is",streamArray[i].key)
           testCount = 0 
          break
        } 
    } 

    socket.join(room)
    const peer = new webrtc.RTCPeerConnection(config);
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    console.log(stream,'stream data')
    stream.getTracks().forEach(track => peer.addTrack(track, senderStream));
    console.log("after")
    const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      const payload = {
          sdp: peer.localDescription
      } 
       io.to(room).emit('result',payload)
   })
  });
} catch (error) {
   console.error(error)
}


