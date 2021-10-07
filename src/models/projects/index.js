import express from "express";
import ProjectModel from "./schema.js";
import UserModel from "../users/schema.js";

import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { JWTAuthenticate, refreshTokens } from "../../auth/tools.js";
import { JWTAuthMiddleware } from "../../auth/jwtAuth.js";
import createError from "http-errors";
// import RoomModel from "../models/Room/index.js";

const projectsRouter = express.Router();

projectsRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const newProject = new ProjectModel(req.body);
    const response = await newProject.save();
    const user = req.user;
    user.projects.push(newProject);
    await user.save();
    res.status(201).send(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

projectsRouter.get("/", async (req, res, next) => {
  try {
    const response = await ProjectModel.find().populate("seller", { firstname: 1, lastname: 1, picture: 1 });
    res.status(201).send(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

projectsRouter.get("/:id", async (req, res, next) => {
  try {
    const singleProject = await ProjectModel.findById(req.params.id).populate("seller bids.user", { firstname: 1, lastname: 1, picture: 1 });
    // .select("seller bids");

    if (singleProject) {
      res.send(singleProject);
    } else {
      next(createError(404, `Project ${req.params.id} not found `));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

projectsRouter.get("/search/:query", async (req, res, next) => {
  try {
    const regex = new RegExp(req.params.query, "i");
    console.log(regex);
    // const projects = await ProjectModel.find({ summary: { $regex: regex } });
    const projects = await ProjectModel.find({ summary: { $regex: req.params.query } });

    console.log(req.params.query);
    console.log(projects);

    res.send(projects);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

projectsRouter.get("/search/category/:query", async (req, res, next) => {
  try {
    const regex = new RegExp(req.params.query, "i");
    console.log(regex);
    // const projects = await ProjectModel.find({ summary: { $regex: regex } });
    const projects = await ProjectModel.find({ category: { $regex: req.params.query } });

    console.log(req.params.query);
    console.log(projects);

    res.send(projects);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

projectsRouter.get("/search/:query/:location", async (req, res, next) => {
  try {
    const regex = new RegExp(req.params.query, "i");
    console.log(regex);
    // const projects = await ProjectModel.find({ summary: { $regex: regex } });
    // const projects = await ProjectModel.find({ summary: { $regex: req.params.query }  });
    const projects = await ProjectModel.find({ $and: [{ summary: { $regex: req.params.query } }, { location: { $regex: req.params.location } }] });

    console.log(req.params.query);
    console.log(projects);

    res.send(projects);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// const myCart = [];

// projectsRouter.get("/:id/addToCart", async (req, res, next) => {
//   try {
//     const currentProject = await ProjectModel.findById(req.params.id);
//     const newCart = [...myCart];
//     newCart.push(currentProject);
//     res.send(newCart);
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// });

// projectsRouter.get("/myCart", async (req, res, next) => {
//   try {
//     const currentProject = await ProjectModel.findById(req.params.id);
//     const newCart = [...myCart];
//     newCart.push(currentProject);
//     res.send(newCart);
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// });

/**********************************************************/
projectsRouter.post("/:id/bids", async (req, res, next) => {
  try {
    // const user = await UserModel.find({}).select("_id");
    // const user = req.user
    // console.log(user);
    const singleProject = await ProjectModel.findById(req.params.id);
    const newBid = req.body;
    const user = await UserModel.findById("6128d7f565384b4ca09f9406");
    console.log(user);
    user.myBids.push(newBid);
    await user.save();

    singleProject.bids.push(newBid);
    await singleProject.save();
    res.send(singleProject);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

projectsRouter.get("/:id/bids/:bidID", async (req, res, next) => {
  try {
    const allBids = await ProjectModel.findById(req.params.id).select("bids");
    console.log(allBids.bids);
    const bid = allBids.bids.filter((bid) => bid._id == req.params.bidID);

    if (bid) {
      res.send(bid);
    } else {
      next(createError(404, `bid ${req.params.bidID} not found `));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

projectsRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    await req.user.deleteOne();
  } catch (error) {
    next(error);
  }
});

projectsRouter.put("/:id", async (req, res, next) => {
  try {
    const project = await ProjectModel.findById(req.params.id);
    project.summary = req.body.summary;
    project.location = req.body.location;
    project.Description = req.body.Description;
    project.title = req.body.title;
    await project.save();
    res.send(project);
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

const upload = multer({ storage: cloudinaryStorage }).single("file");

projectsRouter.post("/:id/uploadFile", upload, async (req, res, next) => {
  try {
    console.log(req.file);
    const project = await ProjectModel.findById(req.params.id);
    console.log(project);
    project.files = req.file.path;
    await project.save();
    res.send(project.files);
  } catch (error) {
    next(error);
  }
});

projectsRouter.post("/:id/sendmail", async (req, res, next) => {
  try {
    const project = await ProjectModel.findById(req.params.id);

    await sendBlogPostMail({
      to: author.email,
      title: project,
      link: `http://localhost:3000/blogs/${blog.id}`,
    });
  } catch (error) {
    next(error);
  }
});






// // GET /me/chats

// // const chatRooms = await RoomModel.find({ members: req.user._id }, { select: [ NO CHAT HISTORY ] })

// projectsRouter.get("/me/chats", JWTAuthMiddleware, async (req, res) => {
//   console.log("req.user._id:", req.user._id);
//   const rooms = await RoomModel.find({ members: req.user._id }).populate("members");
//   // console.log('rooms:', rooms)
//   // const myChats = rooms.filter((item) => (item.members.includes(req.user._id)))
//   // const chats = []
//   // myChats.forEach((item) => (chats.push({ "title": item.title })))
//   res.status(200).send(rooms);
// });

export default projectsRouter;
