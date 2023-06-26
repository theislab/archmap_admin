import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";

dotenv.config();

export async function getAllAtlases() {
  try {
    const users = await UserModel.find({});
    const userMap = [];

    // map only the id, email and role
    users.forEach(function (user) {
      userMap.push({
        id: user._id,
        email: user.email,
        role: user.role,
        permission: user.uploadPermission,
      });
    });
    console.log(userMap);

    return userMap;
  } catch (err) {
    throw err;
  }
}

// function to change the normal user to admin and vice versa on basis of request
export async function changeRole(userId, userRoleToChange) {
  try {
    await UserModel.findByIdAndUpdate(userId, { role: userRoleToChange });
    console.log("User Role Changed Successfully");
  } catch (err) {
    throw err;
  }
}
