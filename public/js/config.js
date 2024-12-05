// turnConfig ={
//   iceServers: [{   urls: [ "stun:bn-turn2.xirsys.com" ]}, {   username: "o8_s2lbVKiqxpNa5Ntw5kG_h7g9zYj-AbK49RHWtnH26b_exoUgSkD5MrvzAQkpMAAAAAGcrwiBzYXJhdGhz",   credential: "90886c3c-9c74-11ef-8e6e-0242ac140004",   urls: [       "turn:bn-turn2.xirsys.com:80?transport=udp",       "turn:bn-turn2.xirsys.com:3478?transport=udp",       "turn:bn-turn2.xirsys.com:80?transport=tcp",       "turn:bn-turn2.xirsys.com:3478?transport=tcp",       "turns:bn-turn2.xirsys.com:443?transport=tcp",       "turns:bn-turn2.xirsys.com:5349?transport=tcp"   ]}]
// }
 turnConfig = {
  iceServers: [
    {
      urls: "stun:global.stun.twilio.com:3478"
    },
    {
      urls: "turn:global.turn.twilio.com:3478?transport=udp",
      username: "978b4e0aa4bd05e0e6f47f1f68a7b5edf9fe1e6bbdc777a1042b8924bf3c5a2e",
      credential: "cYV04JfTfKFBDwAwRMIoYYRCNQWsccvXd6V/7vJ2zLI="
    },
    {
      urls: "turn:global.turn.twilio.com:3478?transport=tcp",
      username: "978b4e0aa4bd05e0e6f47f1f68a7b5edf9fe1e6bbdc777a1042b8924bf3c5a2e",
      credential: "cYV04JfTfKFBDwAwRMIoYYRCNQWsccvXd6V/7vJ2zLI="
    },
    {
      urls: "turn:global.turn.twilio.com:443?transport=tcp",
      username: "978b4e0aa4bd05e0e6f47f1f68a7b5edf9fe1e6bbdc777a1042b8924bf3c5a2e",
      credential: "cYV04JfTfKFBDwAwRMIoYYRCNQWsccvXd6V/7vJ2zLI="
    }
  ]
}