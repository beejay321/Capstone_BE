import express from "express";
import UserModel from "./schema.js";
// import RoomModel from "../Room/schema.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { JWTAuthenticate, refreshTokens } from "../../auth/tools.js";
import { JWTAuthMiddleware } from "../../auth/jwtAuth.js";
import createError from "http-errors";

const usersRouter = express.Router();

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body);
    await newUser.save();
    res.status(201).send(newUser);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.checkCredentials(email, password);
    if (user) {
      const { accessToken, refreshToken } = await JWTAuthenticate(user);

      // res.cookie("accessToken", req.user.tokens.accessToken, { httpOnly: true });
      // res.cookie("refreshToken", req.user.tokens.refreshToken, { httpOnly: true });
      res.send({ accessToken, refreshToken, username: user.email, _id: user._id });
    } else {
      next(createError(401));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.post("/logOut", async (req, res, next) => {
  try {
    if (user) {
      const { accessToken, refreshToken } = await JWTAuthenticate(user);

      // delete all tokens from local storage
      res.send({ accessToken, refreshToken, username: user.email, _id: user._id });
    } else {
      next(createError(401));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.post("/refreshToken", async (req, res, next) => {
  try {
    const { newAccessToken, newRefreshToken } = await refreshTokens(req.cookies.actualRefreshToken);
    res.send({ newAccessToken, newRefreshToken });
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/", async (req, res, next) => {
  try {
    const response = await UserModel.find();
    res.status(201).send(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    console.log(req.user._id);
    const response = await UserModel.findById(req.user._id).populate("projects");

    res.send(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.get("/:id", async (req, res, next) => {
  try {
    const response = await UserModel.findById(req.params.id).populate("projects");
    res.status(201).send(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.get("/search/:query", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const regex = new RegExp(req.params.query, "i");
    console.log(regex);
    const users = await UserModel.find({ username: { $regex: regex } });

    console.log(req.params.query);
    console.log(users);
    const otherUsers = users.filter((user) => user._id.toString() !== req.user._id.toString());

    res.send(users);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    await req.user.deleteOne();
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/me/updateProfile", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = req.user;
    user.firstname = req.body.firstname ? req.body.firstname : user.firstname;
    user.lastname = req.body.lastname ? req.body.lastname : user.lastname;
    user.headline = req.body.headline ? req.body.headline : user.headline;
    user.languages = req.body.languages ? req.body.languages : user.languages;
    user.location = req.body.location;
    await user.save();
    console.log(user);
    res.send(user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.post("/me/experience", JWTAuthMiddleware, async (req, res, next) => {
  try {
    console.log(req.user);
    const user = req.user;
    const myExperiences = req.user.experience;
    const newExperience = req.body;
    myExperiences.push(newExperience);
    await user.save();
    res.send(myExperiences);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
usersRouter.post("/me/project", JWTAuthMiddleware, async (req, res, next) => {
  try {
    console.log(req.user);
    const user = req.user;
    const myProjects = req.user.projects;
    const newProject = req.body;
    myProjects.push(newProject);
    await user.save();
    res.send(myProjects);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
usersRouter.post("/me/education", JWTAuthMiddleware, async (req, res, next) => {
  try {
    console.log(req.user);
    const user = req.user;
    const myEducation = req.user.education;
    const newEducation = req.body;
    myEducation.push(newEducation);
    await user.save();
    res.send(myEducation);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
usersRouter.post("/me/skill", JWTAuthMiddleware, async (req, res, next) => {
  try {
    console.log(req.user);
    const user = req.user;
    const mySkills = req.user.skills;
    const newSkill = req.body;
    mySkills.push(newSkill);
    await user.save();
    res.send(myProjects);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.post("/me/bids", JWTAuthMiddleware, async (req, res, next) => {
  try {
    console.log(req.user);
    const user = req.user;
    const mySkills = req.user.skills;
    const newSkill = req.body;
    mySkills.push(newSkill);
    await user.save();
    res.send(myProjects);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "Capstone",
  },
});

const upload = multer({ storage: cloudinaryStorage }).single("avatar");

usersRouter.post("/me/uploadAvatar", upload, JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user._id);
    user.avatar = req.file.path;
    await user.save();
    res.send(user.avatar);
  } catch (error) {
    next(error);
  }
});

// GET /me/chats

// const chatRooms = await RoomModel.find({ members: req.user._id }, { select: [ NO CHAT HISTORY ] })

usersRouter.get("/me/chats", JWTAuthMiddleware, async (req, res) => {
  console.log("req.user._id:", req.user._id);
  const rooms = await RoomModel.find({ members: req.user._id }).populate("members");
  // console.log('rooms:', rooms)
  // const myChats = rooms.filter((item) => (item.members.includes(req.user._id)))
  // const chats = []
  // myChats.forEach((item) => (chats.push({ "title": item.title })))
  res.status(200).send(rooms);
});

usersRouter.get("/me/chat/:id", JWTAuthMiddleware, async (req, res) => {
  console.log("req.user._id:", req.user._id);
  const room = await RoomModel.find({ members: [req.user._id, req.params.id] });
  res.status(200).send(room);
});

export default usersRouter;
