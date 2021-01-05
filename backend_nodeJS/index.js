const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
const router = require("./router");
const { addUser, removeUser, getUser, getUserInRoom } = require("./users.js");

// port
const port = process.env.PORT || 4000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// setup connection
// const chatNsp = io.of("/chat");
io.on("connection", (socket) => {
  console.log("Connected to app.");
  console.log(socket.handshake.query);
  socket.on("join", ({ name, room }, callBack) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) {
      return callBack({ error, status: 400 });
    }

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, Welcome to ${user.room}`,
    });
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name}, joind the chat` });
    socket.join(user.room);
    io.to(user.room).emit("roomData", {
      room: user.room,
      user: getUserInRoom(user.room),
    });
    callBack({ status: 200 });
  });

  socket.on("sendMessage", (message, callBack) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });
    io.to(user.room).emit("roomData", {
      room: user.room,
      user: getUserInRoom(user.room),
    });
    callBack({ status: 200 });
  });

  socket.on("disconnect", () => {
    console.log("User Left");
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} left`,
      });
    }
  });
});

// router as a midleware
app.use(router);
server.listen(port, () =>
  console.log(`Server has started on port http://localhost:${port}`)
);
