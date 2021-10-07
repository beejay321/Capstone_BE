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
  const room = await RoomModel.findById( req.params.roomId )
  res.status(200).send({ chatHistory: room.chatHistory });
});

chatRouter.get("/user/:id", JWTAuthMiddleware, async (req, res) => {
  console.log("req.params.id:", req.params.id);
  console.log("req.user._id:", req.user._id);
  const room = await RoomModel.findOne({ $and: [{ members: req.params.id }, { members: req.user._id }] }).populate("members");
  console.log("room:", room);

  if (room) {
    res.status(200).send(room);
  } else {
    const newRoom = {
      members: [req.params.id, req.user._id],
    };
    const chatRoom = new RoomModel(newRoom);
    await chatRoom.save();

    const actualChatRoom = await RoomModel.findOne({ $and: [{ members: req.params.id }, { members: req.user._id }] }).populate("members");
    console.log("actualChatRoom:", actualChatRoom);
    res.status(200).send(actualChatRoom);
  }
});

export default chatRouter;
