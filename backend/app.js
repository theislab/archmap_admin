import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import { MongoClient } from "mongodb";
import atlasRouter from "./routes/atlasRouter.js";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { AtlasModel } from "./models/Atlas.js";
import { Storage } from "@google-cloud/storage";

import https from "https";
import fs from "fs";
import authRouter from "./routes/authRoutes.js";
import axios from "axios";
import {
  verifyIfAdmin,
  verifyIfNormal,
  verifyIfUploadPermission,
} from "./middleware/authJWT.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const uploadDirectory = "tmp_upload/";
const MAX_FILE_SIZE = 25 * 1024 * 1024 * 1024; // 25 GB

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const initializeDB = async () => {
  await connectDB();
};

// app.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// );
// app.use(bodyParser.json());
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });
// app.use(multer({ storage }).any());

const upload = multer({
  dest: uploadDirectory,
  limits: { fileSize: MAX_FILE_SIZE },
});

// Create the upload directory if it doesn't exist
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

// Configure CORS options
const corsOptions = {
  origin: "http://localhost:3000",
};
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post(
  "/api/atlases",
  verifyIfUploadPermission,
  upload.single("file"),
  async (req, res) => {
    console.log("/api/atlases called");
    console.log("req.body is ", req.body);
    let atlasDocument;
    try {
      // Connect to the database

      // console.log("req is ", req.files);
      // if url is present file need not be present

      if (!req.file && req.body.atlasUrl === "") {
        res.status(400).send("No file uploaded.");
        return;
      }

      await connectDB();

      // Create a new Atlas document
      const atlasData = {
        name: req.body.name,
        previewPictureURL: req.body.previewPictureURL,
        modalities: req.body.modalities,
        numberOfCells: req.body.numberOfCells,
        species: req.body.species,
        compatibleModels: req.body.compatibleModels,
        uploadedBy: req.body.userId,
        atlasUrl: req.body.atlasUrl,
      };
      // console.log("atlasData is ", atlasData);
      atlasDocument = await AtlasModel.create(atlasData);

      // Upload the file to GCP
      const storage = new Storage({
        projectId: process.env.GCP_PROJECT_ID,
        keyFilename: process.env.GCP_KEYFILE,
      });
      console.log("process.env.GCP_BUCKET_NAME", process.env.GCP_BUCKET_NAME);

      // if atlasUrl is not provided,
      // upload the file to GCP else call
      //the post request to the https://atlas-download-4obuqt4kuq-ey.a.run.app/download

      if (atlasData.atlasUrl === "") {
        const filename = req.file.filename;
        const originalName = req.file.originalname;
        const filePath = req.file.path;
        console.log("filepath is ", filePath);

        const bucket = storage.bucket(process.env.GCP_BUCKET_NAME);
        const blob = bucket.file(`atlas/${atlasDocument._id}/data.h5ad`);
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: "application/octet-stream",
          },
        });
        blobStream.on("error", (err) => {
          console.error(err);
          res.status(500).send("Failed to upload file to GCP");
        });
        blobStream.on("finish", async () => {
          console.log("File uploaded to GCP");

          // Return the Atlas ID as a response
          res.json({
            atlasId: atlasDocument._id,
            message: `File uploaded to gcp in the path: atlas/${atlasDocument._id}/data.h5ad`,
          });
        });

        const readStream = fs.createReadStream(filePath);
        readStream.pipe(blobStream);
        blobStream.on("close", () => {
          console.log("Response sent");
          // Delete the file from the server
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      } else {
        //send the post request and wait for the response and send the response to the client if the upload is not successful
        console.log("Downloading the file from the url and uploading to GCP");
        const response = await axios.post(process.env.ATLAS_UPLOAD_URI, {
          url: atlasData.atlasUrl,
          path_to_store: `atlas/${atlasDocument._id}`,
          file_name: "data.h5ad",
        });
        // console.log("response is ", response.data);
        // check if its not 200
        if (response.status !== 200) {
          res.status(500).send("Failed to upload file to GCP");
          return;
        }
        // Return the Atlas ID as a response
        res.json({
          atlasId: atlasDocument._id,
          message: `File uploaded to gcp in the path: atlas/${atlasDocument._id}/data.h5ad`,
        });
      }
    } catch (err) {
      console.error(err);
      // delete the project from the database
      if (atlasDocument) {
        await AtlasModel.deleteOne({ _id: atlasDocument._id });
        console.log("deleted atlasDocument of id ", atlasDocument._id);
      }

      res.status(500).send("Internal Server Error");
    } finally {
      // fs.unlinkSync(req.file.path);
    }
  }
);

app.use(atlasRouter);
app.use(authRouter);

app.listen(port, async () => {
  await initializeDB();
  console.log(`Server running on port ${port}`);
});

export default app;
