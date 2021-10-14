import mongoose from "mongoose";
import MessageSchema from "../Message/schema.js";
const { Schema, model } = mongoose;

const RoomSchema = new mongoose.Schema({
  chatHistory: {
    type: [MessageSchema],
    required: true,
    default: [],
  },
  members: [{ type: Schema.Types.ObjectId, ref: "user" }],
});
export default model("room", RoomSchema);
