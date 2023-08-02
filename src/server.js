import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import { createServer } from "http";
import usersRouter from "./models/users/index.js";
import projectsRouter from "./models/projects/index.js";
import chatRouter from "./models/Room/index.js";
import RoomModel from "./models/Room/schema.js";
import {
  unAuthorizedHandler,
  notFoundErrorHandler,
  badRequestErrorHandler,
  forbiddenErrorHandler,
  catchAllErrorHandler,
} from "./errorHandlers.js";

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);

app.use("/users", usersRouter);
app.use("/projects", projectsRouter);
// app.use("/room", chatRouter);

app.use(unAuthorizedHandler);
app.use(notFoundErrorHandler);
app.use(badRequestErrorHandler);
app.use(forbiddenErrorHandler);
app.use(catchAllErrorHandler);

const port = process.env.PORT;

mongoose
  .connect(process.env.MONGO_CONNECTION, { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to mongo");
    server.listen(port, () => {
      console.table(listEndpoints(app));
      console.log("Server listening on port " + port);
    });
  });
