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

const tar = require("tar");
var targz = require("tar.gz");
var zlib = require("zlib");
var extractZip = require("extract-zip");

// Upload the extracted files if it's a tar.gz or zip file

const extractDir =
  "/Users/xaviergeorge/Code/Helmholtz/atlas_download_server/tmp/extracted";

const tempDestFileName =
  "/Users/xaviergeorge/Code/Helmholtz/atlas_download_server/tmp/External_test_data.tar.gz";

console.log("Extracting tar.gz file", tempDestFileName);
const isZip = path.extname(tempDestFileName) === ".zip";
console.log("isZip", isZip);

function extractFile(isZip, src, dest, cb) {
  console.log("Extracting %s to %s", src, dest);

  if (isZip) {
    extractZip(src, { dir: dest }, cb); // async probably
  } else {
    console.log("Extracting tar.gz file");
    tar.extract({ file: src, cwd: dest }, null, cb);
  }
}

extractFile(isZip, tempDestFileName, extractDir, function (err) {
  if (err) {
    console.log("Error extracting file", err);
    throw err;
  }
  //check if the directory is empty
  console.log("Chcking if directory is empty");
  if (fs.readdirSync(extractDir).length === 0) {
    console.log("Directory is empty");
    return;
  }

  fs.readdirSync(extractDir).forEach(async (file) => {
    console.log("File is: ", file);
    const filePath = path.join(extractDir, file);
    if (fs.statSync(filePath).isFile()) {
      console.log(`Uploading extracted file: ${filePath}`);

      console.log(`Uploaded extracted file: ${file}`);
    }
  });
  // fs.unlink(tempDestFileName, function (err) {
  //   if (err) throw err;
  //   console.log(`$destFileName was deleted`);
  // });
});
