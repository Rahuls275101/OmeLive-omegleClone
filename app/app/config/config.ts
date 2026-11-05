// config/config.ts

export const configuration: RTCConfiguration = {
  iceServers: [
    // Public Google STUN Servers
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },

    // Metered STUN Server
    { urls: 'stun:stun.relay.metered.ca:80' },

    // Metered TURN Server (UDP - Port 80)
    {
      urls: 'turn:global.relay.metered.ca:80',
      username: 'e0f00dd03d4b954846de7422',
      credential: 'rZhrdV8450wwixDW',
    },

    // Metered TURN Server (TCP - Port 80)
    {
      urls: 'turn:global.relay.metered.ca:80?transport=tcp',
      username: 'e0f00dd03d4b954846de7422',
      credential: 'rZhrdV8450wwixDW',
    },

    // Metered TURN Server (Port 443)
    {
      urls: 'turn:global.relay.metered.ca:443',
      username: 'e0f00dd03d4b954846de7422',
      credential: 'rZhrdV8450wwixDW',
    },

    // Metered Secure TURNS Server (TLS over TCP - Port 443)
    {
      urls: 'turns:global.relay.metered.ca:443?transport=tcp',
      username: 'e0f00dd03d4b954846de7422',
      credential: 'rZhrdV8450wwixDW',
    },
  ],
};

export default configuration;