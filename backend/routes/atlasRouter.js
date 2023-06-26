import multer from "multer";
import { connectDB } from "../config/db.js";
import { fileExists } from "../config/storage.js";
import { AtlasModel, Atlas } from "../models/Atlas.js";
import express from "express";
import { Storage } from "@google-cloud/storage";
import {
  verifyIfAdmin,
  verifyIfNormal,
  verifyIfUploadPermission,
} from "../middleware/authJWT.js";

const atlasRouter = express.Router();

atlasRouter.post("/api/json", (req, res) => {
  console.log(req.body);
  res.send("Received JSON data!");
});

// Get all the atlases
atlasRouter.get("/api/atlases", verifyIfAdmin, async (req, res) => {
  try {
    // Connect to the database
    await connectDB();
    console.log("Get all atlases");

    const atlasDocuments = await AtlasModel.find({});

    // Find all the atlases

    // Create Atlas instances with proper structure and check if the preview image file exists in GCP Cloud Storage
    const atlasesPromises = atlasDocuments.map(async (doc) => {
      const { existsInGCP, fileSize } = await fileExists(doc._id.toString());

      return new Atlas(
        doc._id,
        doc.name,
        doc.previewPictureURL,
        doc.modalities,
        doc.numberOfCells,
        doc.species,
        doc.compatibleModels,
        existsInGCP,
        true,
        fileSize
      );
    });

    const atlases = await Promise.all(atlasesPromises);

    // connect to gcp and check if the file exists

    res.json(atlases);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

atlasRouter.get("/api/atlases/user/:id", verifyIfNormal, async (req, res) => {
  try {
    //get the param id
    const userId = req.params.id;

    // Connect to the database

    const atlasDocuments = await AtlasModel.find({ uploadedBy: userId });
    console.log("atlasDocuments in get user/:Id ----> ", atlasDocuments);
    // send the atlases back
    const atlasesPromises = atlasDocuments.map(async (doc) => {
      const { existsInGCP, fileSize } = await fileExists(doc._id.toString());

      return new Atlas(
        doc._id,
        doc.name,
        doc.previewPictureURL,
        doc.modalities,
        doc.numberOfCells,
        doc.species,
        doc.compatibleModels,
        existsInGCP,
        true,
        fileSize
      );
    });

    const atlases = await Promise.all(atlasesPromises);
    res.json(atlases);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

//Get one atlas by id
atlasRouter.get("/api/atlases/:id", async (req, res) => {
  try {
    // Find the atlas by id
    const atlasDocument = await AtlasModel.findById(req.params.id);
    if (!atlasDocument) {
      return res.status(404).send("Atlas not found");
    }

    // find if it is present in GCP
    const { existsInGCP, fileSize } = await fileExists(
      atlasDocument._id.toString()
    );

    // create an Atlas instance
    const atlas = new Atlas(
      atlasDocument._id,
      atlasDocument.name,
      atlasDocument.previewPictureURL,
      atlasDocument.modalities,
      atlasDocument.numberOfCells,
      atlasDocument.species,
      atlasDocument.compatibleModels,
      existsInGCP,
      true,
      fileSize
    );
    res.json(atlas);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

atlasRouter.delete(
  "/api/atlases/:id",
  verifyIfUploadPermission,
  async (req, res) => {
    try {
      console.log("req.params.id is ", req.params.id);
      console.log("delete atlas");
      const atlasId = req.params.id;

      // Check if the atlas exists in MongoDB
      const atlasDocument = await AtlasModel.findById(atlasId);
      if (!atlasDocument) {
        return res.status(404).send("Atlas not found");
      }

      // Delete the atlas from MongoDB
      await AtlasModel.findByIdAndDelete(atlasId);

      // Delete the atlas from GCP
      const storage = new Storage({
        projectId: process.env.GCP_PROJECT_ID,
        keyFilename: process.env.GCP_KEYFILE,
      });
      const bucketName = process.env.GCP_BUCKET_NAME;
      const fileName = `atlas/${atlasId}/data.h5ad`;
      const file = storage.bucket(bucketName).file(fileName);
      const [exists] = await file.exists();
      if (exists) {
        await file.delete();
      }

      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  }
);

//Edit the atlas
atlasRouter.put(
  "/api/atlases/:id",
  verifyIfUploadPermission,
  async (req, res) => {
    try {
      const atlasId = req.params.id;

      const updatedAtlasData = req.body; //req.body is the data sent by the client
      console.log("req.body is ", req.body);

      // Check if the atlas exists in MongoDB
      const atlasDocument = await AtlasModel.findById(atlasId);
      if (!atlasDocument) {
        return res.status(404).send("Atlas not found");
      }

      // Update the atlas in MongoDB
      await AtlasModel.findByIdAndUpdate(atlasId, updatedAtlasData);
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  }
);

export default atlasRouter;

// curl -X POST \
//   http://localhost:8080/api/atlases \
//   -H 'Content-Type: multipart/form-data' \
//   -H 'cache-control: no-cache' \
//   -F 'name=My Atlas' \
//   -F 'previewPictureURL=https://example.com/myimage.jpg' \
//   -F 'modalities=RNA-Seq,ATAC-Seq' \
//   -F 'numberOfCells=10000' \
//   -F 'species=Mouse'\
//   -F 'file=@/Users/xaviergeorge/Downloads/demo_scanvi.h5ad'
