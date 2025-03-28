const io = require("socket.io-client");
const socket = io("http://192.168.0.100:3000");

socket.on("connect", () => {
  console.log("Connected to Socket.IO server");
  socket.emit("test", "Hello from test client");
});

socket.on("test", (data) => {
  console.log("Received from server:", data);
});

socket.on("disconnect", () => console.log("Disconnected"));
