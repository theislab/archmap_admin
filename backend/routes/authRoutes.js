import express from "express";

import { signin, signup } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/authJWT.js";
import {
  changeRole,
  getAllAtlases,
} from "../controllers/authUser.controller.js";
import { changePermission } from "../utils/utils.js";

const authRouter = express.Router();

authRouter.post("/register", signup, function (req, res) {});

authRouter.post("/login", signin, function (req, res) {});

authRouter.get("/hiddencontent", verifyToken, function (req, res) {
  console.log("req.user in the main route", req.user);
  if (!req.user) {
    res.status(403).send({
      message: "Invalid JWT token",
    });
  }
  if (req.user.role == "admin") {
    res.status(200).send({
      message: "Congratulations! but there is no hidden content",
    });
  } else {
    console.log("req.user.role", req.user.role);
    res.status(403).send({
      message: "Unauthorised access",
    });
  }
});

authRouter.get("/users", async (req, res) => {
  try {
    const allUsers = await getAllAtlases();
    res.json(allUsers);
  } catch (err) {}
});

authRouter.put("/users/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const role = req.body.role;
    await changeRole(id, role);
    res.status(200).send({
      message: "User role changed successfully",
    });
  } catch (err) {
    console.log("err", err);
    res.status(500).send({
      message: err,
    });
  }
});

//route to give permission or deny permission to the user to upload the atlas
authRouter.put("/users/:id/permission", async (req, res) => {
  console.log("req.body", req.body);
  console.log("Req.params", req.params);
  try {
    const id = req.params.id;
    const permission = req.body.permission;
    await changePermission(id, permission);
    res.status(200).send({
      message: "User permission changed successfully",
    });
  } catch (err) {
    console.log("err", err);
    res.status(500).send({
      message: err,
    });
  }
});

export default authRouter;
