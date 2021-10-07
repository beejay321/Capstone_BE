import mongoose from "mongoose";
import MessageSchema from "../Message/schema.js";
const { Schema, model } = mongoose;

const projectsSchema = new mongoose.Schema(
  {
    seller: { type: Schema.Types.ObjectId, ref: "user" },
    title: { type: String },
    summary: { type: String },
    location: { type: String },
    Description: { type: String },
    files: { type: String },
    bids: [
      {
        user: { type: Schema.Types.ObjectId, ref: "user" },
        client: { type: Schema.Types.ObjectId, ref: "user" },
        projectTitle: { type: String },
        avatar: { type: String },
        message: { type: String },
        cost: { type: String },
        duration: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default model("project", projectsSchema);
