import UserModel from "../models/userModel.js";

export const changePermission = async (id, permission) => {
  try {
    let uploadPermissionToChange;
    if (permission === true) {
      uploadPermissionToChange = "upload";
    } else {
      uploadPermissionToChange = "none";
    }
    await UserModel.findByIdAndUpdate(id, {
      uploadPermission: uploadPermissionToChange,
    });
    console.log("User Permission Changed Successfully");
  } catch (err) {
    throw err;
  }
};
