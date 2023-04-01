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


  // Sending all broadcasters to client
  socket.emit('broadcasters', broadcasters);

  socket.on("register as broadcaster", (user) => {
    // Additional validation for duplicate broadcaster in same room
    if (broadcasters[user.room]) {
      console.log(`${broadcasters[user.room].name} is already broadcasting in room ${user.room}`)
    }
    else {
      console.log("register as broadcaster for room", user.room);

      broadcasters[user.room] = { id: socket.id, name: user.name };

      socket.join(user.room);
    }
  });

  socket.on("register as viewer", (user) => {
    console.log("register as viewer for room", user.room);

    socket.join(user.room);
    user.id = socket.id;

    socket.to(broadcasters[user.room].id).emit("new viewer", user);
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
    socket.to(broadcasters[event.room].id).emit("answer", socket.id, event.sdp);
  });

  socket.on("broadcaster left", (user) => {
    console.log('broadcaster left:', user)
    delete broadcasters[user.room]
    socket.leave(user.room)
    socket.broadcast.emit('broadcasters', broadcasters);
  })

});

server.listen(port, () => {
  console.log(`[server]: Server is running on port ${port}`);
  
});