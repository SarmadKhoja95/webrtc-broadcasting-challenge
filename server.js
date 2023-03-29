const http = require('http');
const { Server } = require("socket.io")
const dotenv = require('dotenv');

dotenv.config();

const port = process.env.PORT;
const server = http.createServer()
const io = new Server(server, {
  cors: {
    origin: '*',
  }
})

const broadcasters = {};

io.on('connection', (socket) => {
  console.log('connection establisted!!!')

  socket.on("register as broadcaster", (room) => {
    console.log("register as broadcaster for room", room);

    broadcasters[room] = socket.id;

    socket.join(room);
  });

  socket.on("register as viewer", (user) => {
    console.log("register as viewer for room", user.room);

    socket.join(user.room);
    user.id = socket.id;

    console.log('emit ice candidate: ')
    socket.to(broadcasters[user.room]).emit("new viewer", user);
  });

  socket.on("candidate", (id, event) => {
    console.log('emit ice candidate: ')
    socket.to(id).emit("candidate", socket.id, event);
  });

  socket.on("offer", (id, event) => {
    event.broadcaster.id = socket.id;
    console.log('emit offer: ')
    socket.to(id).emit("offer", event.broadcaster, event.sdp);
  });

  socket.on("answer", (event) => {
    console.log('emit answer: ')
    socket.to(broadcasters[event.room]).emit("answer", socket.id, event.sdp);
  });
});

server.listen(port, () => {
  console.log(`[server]: Server is running on port ${port}`);
});