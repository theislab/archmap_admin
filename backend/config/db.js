import mongoose from "mongoose";
mongoose.Promise = global.Promise;

const MONGO_URI =
  "mongodb+srv://backend_app:jgJDIfcEvS6AC6o7@archmapdb.wpr5w.mongodb.net/project-management-db";
const MONGO_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, MONGO_OPTIONS);
    console.log("Connected to MongoDB Successfully");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
process.on("unhandledRejection", (err, promise) => {
  console.log(`Logged Error: ${err}`);
});
