import express from "express";
import RoomModel from "./schema.js";
import UserModel from "../users/index.js";
import { JWTAuthMiddleware } from "../../auth/jwtAuth.js";

const chatRouter = express.Router();

// chatRouter.post('/room', async (req, res) => {
//     const room = new RoomModel(req.body)
//     await room.save()

//     res.status(201).send(room)
// })

chatRouter.get("/history/:roomId", async (req, res) => {
  // const room = await RoomModel.find();
  const room = await RoomModel.findById(req.params.roomId);
  res.status(200).send({ chatHistory: room.chatHistory });
});
// get room with 2 users
chatRouter.get("/user/:userId/:memberId", async (req, res) => {
  const room = await RoomModel.findOne({ $and: [{ members: req.params.memberId }, { members: req.params.userId }] }).populate("members");
  console.log("room created");

  if (room) {
    res.status(200).send(room);
  } else {
    const newRoom = {
      members: [req.params.memberId, req.params.userId],
    };
    const chatRoom = new RoomModel(newRoom);
    await chatRoom.save();

    const actualChatRoom = await RoomModel.findOne({ $and: [{ members: req.params.userId }, { members: req.params.memberId }] }).populate("members");
    console.log("actualChatRoom:", actualChatRoom);
    res.status(200).send(actualChatRoom);
  }
});

// get all rooms with the looged in user    

chatRouter.get("/user/:userId", async (req, res) => {
  const rooms = await RoomModel.find({ members: req.params.userId }).populate("members");

  console.log("user rooms found");

  if (rooms) {
    res.status(200).send(rooms);
  } else {
    res.status(404).send("rooms not found");
  }
});

export default chatRouter;
