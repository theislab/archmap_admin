interface Atlas {
  id: string;
  name: string;
  previewPictureURL: string;
  modalities: string;
  numberOfCells: number;
  species: string;
  compatibleModels: string[];
  image?: string;
  title?: string;
  description?: string;
  present_in_mongo?: boolean;
  present_in_gcp?: boolean;
  fileSize?: number;
}

export default Atlas;