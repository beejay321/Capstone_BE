import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import { createServer } from "http";
import { Server } from "socket.io";
import usersRouter from "./models/users/index.js";
import projectsRouter from "./models/projects/index.js";
import chatRouter from "./models/Room/index.js";
import RoomModel from "./models/Room/schema.js";
import { unAuthorizedHandler, notFoundErrorHandler, badRequestErrorHandler, forbiddenErrorHandler, catchAllErrorHandler } from "./errorHandlers.js";

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const io = new Server(server, { allowEIO3: true });

app.use("/users", usersRouter);
app.use("/projects", projectsRouter);
app.use("/room", chatRouter);

io.on("connection", (socket) => {
  // Welcome current user, emits to just the user connecting
  socket.emit("me-ssage", "Welcome to Chat");

  // Broadcast to everyone when a user connects, except the user connecting
  socket.broadcast.emit("me-ssage", "A user just connected");

  // io.emit("message", "Another user just connected");

  // Listen for message from user
  // socket.on("sendMessage", async (message, selectedRoom) => {
  //   io.emit("message", message);
  //   socket.join(selectedRoom);
  //   // socket.broadcast.emit("message", message);
  // });
  socket.on("sendMessage", async (message) => {
    io.emit("message", message.messageToSend);
    // console.log(message);
    socket.join(message.selectedRoom);
    await RoomModel.findOneAndUpdate(message.selectedRoom._id, {
      $push: { chatHistory: message.messageToSend },
    });
    // console.log(selectedRoom.chatHistory);
    // 629a0a3009af17436aad9b05
    socket.broadcast.emit("to-recipient", message);
    socket.to(message.selectedRoom).emit("message", message.messageToSend); 

    //Send this event to everyone in the room.
    io.sockets.in("room-" + message.selectedRoom).emit("connectToRoom", "You are in room no. " + message.selectedRoom);

    console.log(message.selectedRoom);
  });
});

// socket.on("disconnect", () => {
//   console.log("disconnected");
// });

app.use(unAuthorizedHandler);
app.use(notFoundErrorHandler);
app.use(badRequestErrorHandler);
app.use(forbiddenErrorHandler);
app.use(catchAllErrorHandler);

const port = process.env.PORT;

mongoose.connect(process.env.MONGO_CONNECTION, { useNewUrlParser: true }).then(() => {
  console.log("Connected to mongo");
  server.listen(port, () => {
    console.table(listEndpoints(app));
    console.log("Server listening on port " + port);
  });
});
// Line2:26:'Col&
