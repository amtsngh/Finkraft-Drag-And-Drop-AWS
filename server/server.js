const express = require("express");
const AWS = require("aws-sdk");
const app = express();
const multer = require("multer");
var path = require("path");
var filesize = require("file-size");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, preservePath: true });
require("dotenv").config();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

const s3Client = new AWS.S3({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: process.env.region,
});

app.post("/upload", upload.array("files"), (req, res) => {
  const promise_array = [];
  req.files.forEach((file) => {
    let fileExtension = path.extname(file.originalname);

    let fileNameWithPath =
      Array.from(file.originalname)[0] == "/"
        ? file.originalname.substring(1)
        : file.originalname;

    let bucketName =
      fileExtension == ".zip"
        ? process.env.BucketSourceZip
        : process.env.Bucket;

    const params = {
      Acl: "public-read",
      Bucket: bucketName,
      Key: fileNameWithPath,
      Body: file.buffer,
    };
    const putObjectPromise = s3Client.upload(params).promise();
    promise_array.push(putObjectPromise);
  });
  Promise.all(promise_array)
    .then((values) => {
      console.log(values);
      const urls = values.map((value) => value.Location);
      console.log(urls);
      res.send(urls);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.get("/get", (req, res) => {
  var params = {
    Bucket: process.env.Bucket,
  };
  s3Client.listObjects(params, (err, data) => {
    if (err) return res.status(400).send("Failed to get object");

    let fileTree = {};
    data["Contents"].forEach(function (file) {
      var currentNode = fileTree;
      file.Key.split("/").forEach(function (segment) {
        if (segment.length > 0) {
          if (currentNode[segment] === undefined) {
            currentNode[segment] = {
              _fileInfo_: {
                Key: file.Key,
                LastModified: file.LastModified,
                ETag: file.ETag,
                Size: filesize(file.Size).human(),
              },
            };
          }
          currentNode = currentNode[segment];
        }
      });
    });
    res.send(fileTree);
  });
});

app.get("/download", (req, res) => {
  var params = {
    Bucket: process.env.Bucket,
  };
  s3Client.listObjects(params, (err, data) => {
    if (err) return res.status(400).send("Failed to get object");
    let dataArray = [];
    data.Contents.forEach(function (file) {
      let fileToPush = file;
      fileToPush["Url"] = (
        "https://finkraft-ai.s3.ap-south-1.amazonaws.com/" + file.Key
      ).replace(/\s/g, "+");
      fileToPush["Type"] =
        file.Key.indexOf(".") > -1
          ? file.Key.substring(file.Key.lastIndexOf(".") + 1, file.Key.length)
          : "Folder";

      fileToPush["Size"] = filesize(fileToPush["Size"]).human();
      dataArray.push(fileToPush);
    });
    res.send(dataArray);
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});
