import { connectDB } from "../config/db.js";
import UserModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export async function signup(req, res) {
  const user = new UserModel({
    fullName: req.body.fullName,
    email: req.body.email,
    role: "normal",
    password: bcrypt.hashSync(req.body.password, 8),
    uploadPermission: "none",
  });
  console.log("user is", user);

  try {
    const savedUser = await user.save();
    console.log("savedUser", savedUser);
    res.status(200).send({
      message: "User registered successfully",
    });
  } catch (err) {
    console.log("err", err);
    res.status(500).send({
      message: err,
    });
  }
}

export async function signin(req, res) {
  try {
    const user = await UserModel.findOne({ email: req.body.email }).exec();

    if (!user) {
      console.log("User Not found.");
      return res.status(404).send({
        message: "User Not found.",
      });
    }
    console.log("user", user);
    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );
    if (!passwordIsValid) {
      console.log("Invalid Password!");
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.API_SECRET,
      {
        expiresIn: 86400, // 24 hours
      }
    );

    res.status(200).send({
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        permission: user.uploadPermission,
      },
      message: "Login successful",
      accessToken: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal server error occured",
    });
  }
}
