import mongoose from "mongoose";
const { Schema, model } = mongoose;
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    firstname: { type: String },
    lastname: { type: String },
    headline: { type: String },
    languages: [{ type: String }],
    location: { type: String },
    occupation: { type: String },
    avatar: { type: String, default: "https://i.pravatar.cc/100" },
    skills: [{ type: String }],
    myBids: [{ type: Object }],
    projects: [{ type: Schema.Types.ObjectId, ref: "project" }],
    experience: [
      {
        role: { type: String },
        company: { type: String },
        description: { type: String },
        city: { type: String },
        country: { type: String },
        startDate: { type: Date },
      },
    ],
    education: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true },
        startDate: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const newUser = this;
  const plainPw = newUser.password;
  if (newUser.isModified("password")) {
    newUser.password = await bcrypt.hash(plainPw, 10);
  } else {
    next();
  }
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

userSchema.statics.checkCredentials = async function (email, plainPw) {
  const user = await this.findOne({ email });
  if (user) {
    const hashedPw = user.password;
    const isMatch = await bcrypt.compare(plainPw, hashedPw);
    if (isMatch) {
      return user;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default model("user", userSchema);
