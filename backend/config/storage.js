import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";

dotenv.config();

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_KEYFILE,
});

const bucket = storage.bucket(process.env.GCP_BUCKET_NAME);

//check if the data.h5ad for the atlas exist in the bucket
export const fileExists = async (fileName) => {
  //jst-bucket-2022/atlas/626ea3311d7d1a27de465b63/data.h5ad
  // The filename in bucket is the id of the atlas/ + data.h5ad
  const fileNameInBucket = `atlas/${fileName}/data.h5ad`;
  try {
    const [exists] = await bucket.file(fileNameInBucket).exists();
    let fileSize = 0;
    if (exists) {
      const [metadata] = await bucket.file(fileNameInBucket).getMetadata();
      fileSize = metadata.size / 1000000; //convert to MB
    }

    return { existsInGCP: exists, fileSize: fileSize };
  } catch (error) {
    console.log(error);
    console.error(
      "Error checking file existence. The filename is: ",
      fileNameInBucket,
      error
    );
    return { existsInGCP: false, fileSize: 0 };
  }
};
