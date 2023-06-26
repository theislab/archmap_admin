import mongoose from "mongoose";

const AtlasSchema = new mongoose.Schema({
  name: { type: String, required: true },
  previewPictureURL: { type: String, required: true },
  modalities: { type: String, required: true },
  numberOfCells: { type: Number, required: true },
  species: { type: String, required: true },
  compatibleModels: { type: [String], required: true },
  uploadedBy: { type: String, required: false },
  atlasUrl: { type: String, required: false },
});

class Atlas {
  constructor(
    id,
    name,
    previewPictureURL,
    modalities,
    numberOfCells,
    species,
    compatibleModels,
    existsInGCP,
    existsInMongo,
    fileSize,
    uploadedBy = "",
    atlasUrl = ""
  ) {
    this.id = id;
    this.name = name;
    this.previewPictureURL = previewPictureURL;
    this.modalities = modalities;
    this.numberOfCells = numberOfCells;
    this.species = species;
    this.compatibleModels = compatibleModels;
    this.existsInGCP = existsInGCP;
    this.existsInMongo = existsInMongo;
    this.fileSize = fileSize;
    this.uploadedBy = uploadedBy;
    this.atlasUrl = atlasUrl;
  }
}

const AtlasModel = mongoose.model("Atlas", AtlasSchema);

export { AtlasModel, Atlas };
