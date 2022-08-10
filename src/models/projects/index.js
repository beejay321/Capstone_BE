import express from "express";
import ProjectModel from "./schema.js";
import UserModel from "../users/schema.js";
import sendMailAfterPayment from "../../mail/index.js";
import multer from "multer";
import q2m from "query-to-mongo";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { JWTAuthenticate, refreshTokens } from "../../auth/tools.js";
import { JWTAuthMiddleware } from "../../auth/jwtAuth.js";
import createError from "http-errors";
// import RoomModel from "../models/Room/index.js";

const projectsRouter = express.Router();

projectsRouter.post("/:userId", async (req, res, next) => {
  try {
    const newProject = new ProjectModel(req.body);
    const response = await newProject.save();
    const user = await UserModel.findById(req.params.userId);
    user.projects.push(newProject);
    await user.save();
    res.status(201).send(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "CapstoneProjects",
  },
});

const upload = multer({ storage: cloudinaryStorage }).single("file");

// projectsRouter.post("/file/uploadFile", upload, async (req, res, next) => {
//   try {
//     console.log(req.file);
//     res.send(req.file.path);
//   } catch (error) {
//     next(error);
//   }
// });
projectsRouter.post("/:id/uploadFile", upload, async (req, res, next) => {
  try {
    console.log(req.file);
    const project = await ProjectModel.findById(req.params.id);
    console.log(project);
    project.files = req.file.path;
    // project.files.push(req.file.path);
    await project.save();
    res.send(project);
  } catch (error) {
    next(error);
  }
});

projectsRouter.put("/:id/uploadFile", upload, async (req, res, next) => {
  try {
    console.log(req.file);
    const project = await ProjectModel.findById(req.params.id);
    console.log(project);
    // project.files = req.file.path;
    project.files.push(req.file.path);
    await project.save();
    res.send(project.files);
  } catch (error) {
    next(error);
  }
});

projectsRouter.put("/:projectId", async (req, res, next) => {
  try {
    const project = await ProjectModel.findById(req.params.projectId);
    project.title = req.body.title ? req.body.title : project.title;
    project.summary = req.body.summary ? req.body.summary : project.summary;
    project.category = req.body.category ? req.body.category : project.category;
    project.location = req.body.location ? req.body.location : project.location;
    project.Description = req.body.Description ? req.body.Description : project.Description;
    project.files = req.body.files ? req.body.files : project.files;

    await project.save();
    res.send(project);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// projectsRouter.get("/", async (req, res, next) => {
//   try {
//     const response = await ProjectModel.find().populate("seller", { firstname: 1, lastname: 1, picture: 1 });
//     res.status(201).send(response);
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// });

projectsRouter.get("/", async (req, res, next) => {
  try {
    console.log(req.query);
    console.log(q2m(req.query));
    const mongoquery = q2m(req.query);
    const response = await ProjectModel.find(mongoquery.criteria)
      .populate("seller", { firstname: 1, lastname: 1, picture: 1 })
      .sort(mongoquery.options.sort)
      .skip(mongoquery.options.skip)
      .limit(mongoquery.options.limit);
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
    const projects = await ProjectModel.find({ title: { $regex: req.params.query } });

    console.log(req.params.query);
    console.log(projects);

    res.send(projects);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

/**********************************************************/
projectsRouter.post("/:projectid/:userId/bids", async (req, res, next) => {
  try {
    // const user = await UserModel.find({}).select("_id");
    // const user = req.user
    // console.log(user);
    const user = await UserModel.findById(req.params.userId);
    const currentProject = await ProjectModel.findById(req.params.projectid);
    const newBid = req.body;
    user.myBids.push(newBid);
    await user.save();

    currentProject.bids.push(newBid);
    await currentProject.save();
    res.send(currentProject);
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
      res.send(bid[0]);
    } else {
      next(createError(404, `bid ${req.params.bidID} not found `));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

projectsRouter.delete("/:projectId/bids/:bidId", async (req, res, next) => {
  try {
    const projects = await ProjectModel.findById(req.params.projectId);
    const allBids = projects.bids;
    const remainingBids = allBids.filter((bid) => bid._id != req.params.bidId);
    projects.bids = remainingBids;
    await projects.save();
    res.send(projects);
  } catch (error) {
    next(error);
  }
});
projectsRouter.delete("/:projectId", async (req, res, next) => {
  try {
    const project = await ProjectModel.findById(req.params.projectId);
    console.log(project);
    await project.deleteOne(project);
  } catch (error) {
    next(error);
  }
});

// const upload = multer({ storage: cloudinaryStorage });

// projectsRouter.post("/:id/uploadFile", upload.array('multi-files'), async (req, res, next) => {
//   try {
//     console.log(req);
//     // console.log(req.file);
//     // const project = await ProjectModel.findById(req.params.id);
//     // console.log(project);
//     // project.files = req.file.path;
//     // await project.save();
//     // res.send(project.files);
//   } catch (error) {
//     next(error);
//   }
// });

projectsRouter.post("/sendmail/:bidderId", async (req, res, next) => {
  try {
    // const project = await ProjectModel.findById(req.params.id);
    // const bidder = await UserModel.findById(req.params.bidderId);
    const emailSent = await sendMailAfterPayment({
      to: req.body.to,
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      link: `http://localhost:3000/confirmProjectDetails/${req.params.bidderId}`,
    });
    res.send("emailSent");
  } catch (error) {
    console.log(error);
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
