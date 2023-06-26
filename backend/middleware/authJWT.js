import UserModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

import util from "util";
const jwtVerify = util.promisify(jwt.verify);

export const verifyIfAdmin = async (req, res, next) => {
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "JWT"
  ) {
    console.log("req.headers.authorization", req.headers.authorization);
    const token = req.headers.authorization.split(" ")[1];
    const decoded = await jwtVerify(token, process.env.API_SECRET);
    console.log("decoded", decoded);

    const user = await UserModel.findOne({ _id: decoded.id }).exec();
    if (!user) {
      req.user = undefined;
    } else {
      req.user = user;
      console.log("req.user", req.user);
    }
    if (req.user && req.user.role === "admin") {
      console.log("Verified that its an admin");
      next();
    } else {
      res.status(403).send({
        message: "Unauthorised access",
      });
    }
  } else {
    res.status(403).send({
      message: "Unauthorised access: No JWT token found",
    });
  }
};

export const verifyIfNormal = async (req, res, next) => {
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "JWT"
  ) {
    console.log("req.headers.authorization", req.headers.authorization);
    const token = req.headers.authorization.split(" ")[1];
    const decoded = await jwtVerify(token, process.env.API_SECRET);
    console.log("decoded", decoded);

    const user = await UserModel.findOne({ _id: decoded.id }).exec();
    if (!user) {
      req.user = undefined;
    } else {
      req.user = user;
      console.log("req.user", req.user);
    }
    if (req.user && req.user.role === "admin") {
      console.log("Verified that its an admin");
      next();
    } else if (req.user && req.user.role === "normal") {
      console.log("Verified that its a normal user with upload permission");
      next();
    } else {
      res.status(403).send({
        message: "Unauthorised access or User doesn't exist",
      });
    }
  } else {
    res.status(403).send({
      message: "Unauthorised access: No JWT token found",
    });
  }
};

export const verifyIfUploadPermission = async (req, res, next) => {
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "JWT"
  ) {
    console.log("req.headers.authorization", req.headers.authorization);
    const token = req.headers.authorization.split(" ")[1];
    const decoded = await jwtVerify(token, process.env.API_SECRET);
    console.log("decoded", decoded);

    const user = await UserModel.findOne({ _id: decoded.id }).exec();
    if (!user) {
      req.user = undefined;
    } else {
      req.user = user;
      console.log("req.user", req.user);
    }
    if (req.user && req.user.role === "admin") {
      console.log("Verified that its an admin");
      next();
    } else if (
      req.user &&
      req.user.role === "normal" &&
      req.user.uploadPermission == "upload"
    ) {
      console.log("Verified that its a normal user with upload permission");
      next();
    } else {
      res.status(403).send({
        message: "Unauthorised access or User doesn't exist",
      });
    }
  } else {
    res.status(403).send({
      message: "Unauthorised access: No JWT token found",
    });
  }
};

const checkIfUserHasAccessToAtlas = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else if (req.user) {
    res.status(403).send({
      message: "Unauthorised access",
    });
  }
};

export const verifyToken = async (req, res, next) => {
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "JWT"
  ) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      const decoded = await jwtVerify(token, process.env.API_SECRET);
      console.log("decoded", decoded);
      const user = await UserModel.findOne({ _id: decoded.id }).exec();
      console.log("user", user);
      if (!user) {
        req.user = undefined;
      } else {
        req.user = user;
        console.log("req.user", req.user);
      }
      next();
    } catch (err) {
      res.status(500).send({
        message: err,
      });
    }
  } else {
    req.user = undefined;
    next();
  }
};
