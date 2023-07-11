const express = require("express");
const app = express();
const { Storage } = require("@google-cloud/storage");
const fetch = require("node-fetch");
const fs = require("fs");
const dotenv = require("dotenv");
const cors = require("cors");
const url = require("url");
const https = require("https");
const http = require("http");
const validUrl = require("valid-url");
const path = require("path");
const request = require("request");
const sanitize = require("sanitize-filename");
const StreamZip = require("node-stream-zip");
const { promisify } = require("util");
const tar = require("tar");
var extractZip = require("extract-zip");

const projectId = "custom-helix-329116"; // Replace with your Google Cloud project ID
const bucketName = "jst-bucket-2022"; // Replace with your GCS bucket name
const keyFilename = "service_account_key/custom-helix-329116-fd2cd11e3ebb.json"; // Replace with the path to the downloaded private key

dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const port = process.env.PORT || 8080;
// Route to accept a URL and download the file to GCS

const isURL = (url) => {
  return validUrl.isWebUri(url);
};

const extractTar = promisify(tar.extract);

const createDirectory = (directoryPath) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(directoryPath, { recursive: true }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// const getFileNameFromUrl = async (urlString, destDir) => {
//   let fileName = null;
//   request({ urlString, encoding: null }, (error, response, body) => {
//     console.log("re")
//     if (error || response.statusCode < 200 || response.statusCode >= 300) {
//       console.error("Request failed!");
//       response.send("Request failed!");
//       return;
//     }
//     fileName = join(destDir, sanitize(basename(urlString)));
//     if (!extname(fileName)) {
//       const contentType = response.headers["content-type"];
//       const ext = extension(contentType);

//       if (ext) {
//         fileName += `.${ext}`;
//       } else {
//         console.error("Cannot detect file extension!");
//       }
//     }
//   });
//   return fileName;
// };

async function uploadAndDeleteFiles(bucket, sourceDir, destinationDir) {
  const files = fs.readdirSync(sourceDir);
  let count = 0; // Variable to keep track of the number of files uploaded

  for (const file of files) {
    const filePath = path.join(sourceDir, file);
    const fileStats = fs.statSync(filePath);

    if (fileStats.isDirectory()) {
      console.log(`Entering directory: ${file}`);
      const subDirectoryCount = await uploadAndDeleteFiles(
        bucket,
        filePath,
        path.join(destinationDir, file)
      );
      count += subDirectoryCount; // Add the count of files uploaded in subdirectories
    } else if (fileStats.isFile()) {
      console.log(
        `Uploading file: ${filePath} to ${
          process.env.GCP_BUCKET_NAME
        }: ${path.join(destinationDir, file)} `
      );
      await bucket.upload(filePath, {
        destination: path.join(destinationDir, file),
      });
      console.log(`Uploaded file: ${file}`);
      fs.unlinkSync(filePath); // Delete the file after uploading
      console.log(`Deleted file: ${filePath}`);
      count++; // Increment the count of files uploaded
    }
  }

  fs.rmdirSync(sourceDir); // Delete the directory after all files are deleted
  console.log(`Deleted directory: ${sourceDir}`);

  return count; // Return the total count of files uploaded
}

async function extractFile(isZip, src, dest, cb) {
  console.log("Extracting %s to %s", src, dest);

  if (isZip) {
    extractZip(src, { dir: dest }, cb); // async probably
  } else {
    console.log("Extracting tar.gz file");
    extractTar({ file: src, cwd: dest }, null, cb)
      .then(() => {
        console.log("Done extracting tar.gz file");
      })
      .catch((err) => {
        console.log("Error extracting tar.gz file", err);
      });
  }
}

const downloadFile = async (urlString, destFileName) => {
  if (!destFileName) {
    console.error("Cannot get file name!");
    return;
  }
  console.log(`the file name is : ${destFileName}`);
  const file = fs.createWriteStream(destFileName);

  const parsedUrl = url.parse(urlString);
  const protocol = parsedUrl.protocol === "https:" ? https : http;

  try {
    await new Promise((resolve, reject) => {
      const request = protocol
        .get(urlString, function (response) {
          response.pipe(file);
          file.on("finish", function () {
            console.log("File downloaded successfully in finish.");
            file.close(resolve); // Resolve the promise when the file is successfully closed
          });
        })
        .on("error", function (err) {
          // Handle errors
          console.error("error is ", err);
          // fs.unlink(file, () => {
          //   reject(err); // Reject the promise with the error
          // });
        });
    });

    console.log("File downloaded successfully.");
  } catch (error) {
    console.error("Error:", error);
  }
};

app.post("/download", async (req, res) => {
  const { url, path_to_store, file_name } = req.body;

  if (!url || !isURL(url)) {
    res.status(400).send("Please provide a valid 'url' in the request body");
    return;
  }
  if (!path_to_store || typeof path_to_store !== "string") {
    res
      .status(400)
      .send(
        "Please provide a valid 'path_to_store' as a string in the request body"
      );
    return;
  }
  if (!file_name || typeof file_name !== "string") {
    res
      .status(400)
      .send(
        "Please provide a valid 'file_name' as a string in the request body"
      );
    return;
  }
  const tempDir = path.join(__dirname, "tmp");
  const fileNameFromUrl = path.basename(url);
  console.log("fileNameFromUrl", fileNameFromUrl);
  const tempDestFileName = path.join(tempDir, fileNameFromUrl); // gets the filename from the url

  try {
    // Create the temporary directory if it doesn't exist
    await createDirectory(tempDir);

    // Initialize GCS client
    const storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GCP_KEYFILE,
    });
    const bucket = storage.bucket(process.env.GCP_BUCKET_NAME);
    console.log("BUCKET INITIALIZED");
    // Upload the extracted files if it's a tar.gz or zip file
    console.log(
      "path.extname(tempDestFileName)",
      path.extname(tempDestFileName)
    );
    console.log("Downloading file");
    await downloadFile(url, tempDestFileName);
    console.log("File downloaded successfully.");
    console.log("Uploading file to GCS");
    await bucket.upload(tempDestFileName, {
      destination: `${path_to_store}/${file_name}`,
    });
    console.log(
      `Uploaded to ${process.env.GCP_BUCKET_NAME}: ${path_to_store}/${file_name} .`
    );
    res.send(
      `File Uploaded to ${process.env.GCP_BUCKET_NAME}: ${path_to_store}/${file_name}`
    );
    console.log("Unlink", tempDestFileName);
    fs.unlink(tempDestFileName, (err) => {
      if (err) {
        console.error("Error deleting the temporary file:", err);
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred");
  } finally {
    // Clean up: delete the temporary file
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
