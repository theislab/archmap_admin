import mongoose from "mongoose";
import isEmail from "validator/lib/isEmail.js";

// models/userModel
const userSchema = mongoose.Schema({
  email: {
    type: String,
    unique: [true, "Email already exists in the database!"],
    lowercase: true,
    trim: true,
    required: [true, "Email is required"],
    validate: {
      validator: isEmail,
      message: (props) => `${props.value} is not a valid email`,
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    validate: {
      validator: function (value) {
        return value.length >= 6;
      },
      message: () => "Password must be at least six characters long",
    },
  },
  role: {
    type: String,
    enum: ["normal", "admin"],
    required: [true, "Please specify user role"],
  },
  fullName: {
    type: String,
    required: [true, "Please specify user full name"],
  },
  uploadPermission: {
    type: String,
    enum: ["none", "upload"],
    default: "none",
  },
  adminPermissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin", // Replace "Admin" with the appropriate name of the admin model
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

const UserModel = mongoose.model("atlasUser", userSchema);
export default UserModel;
