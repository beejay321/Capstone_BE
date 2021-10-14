import mongoose from "mongoose";
import MessageSchema from "../Message/schema.js";
const { Schema, model } = mongoose;

const projectsSchema = new mongoose.Schema(
  {
    seller: { type: Schema.Types.ObjectId, ref: "user" },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    location: { type: String, required: true },
    // category: { type: String, required: true,
    //   // enum: [Design, Communications, Beauty, Entertainment, Photography, Business]
    // },
    Description: { type: String, required: true },
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
