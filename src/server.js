import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import { createServer } from "http";
import { Server } from "socket.io";
import usersRouter from "./models/users/index.js";
import projectsRouter from "./models/projects/index.js";
import profileRouter from "./models/Profiles/index.js";
import chatRouter from "./models/Room/index.js";
import { unAuthorizedHandler, notFoundErrorHandler, badRequestErrorHandler, forbiddenErrorHandler, catchAllErrorHandler } from "./errorHandlers.js";
import cookieParser from "cookie-parser";
import { verifyToken } from "./auth/tools.js";
import UserModel from "./models/users/index.js";
import RoomModel from "./models/Room/index.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const server = createServer(app);
const io = new Server(server, { allowEIO3: true });

app.use("/users", usersRouter);
app.use("/projects", projectsRouter);
app.use("/profile", profileRouter);
app.use("/room", chatRouter);

io.on("connection", (socket) => {
  socket.emit("chat-message", "Hello World"); 
  
  socket.on("sendMessage", async ({ message, selectedRoom }) => {
    socket.join(selectedRoom);
    await RoomModel.findOneAndUpdate(
      { id: selectedRoom._id },
      {
        $push: { chatHistory: message },
      }
    );
    // socket.to(selectedRoom).emit("message", message);
  });

  // socket.on("disconnect", () => {
  //   console.log("disconnected");
  // });
});

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
