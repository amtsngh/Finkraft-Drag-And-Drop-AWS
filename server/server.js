const express = require("express");
const AWS = require("aws-sdk");
const app = express();
const multer = require("multer");
var path = require("path");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
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
    console.log("file", file.path);
    console.log("originalname", file.originalname);
    let fileExtension = path.extname(file.originalname);
    console.log("fileExtension", fileExtension);
    let bucketName =
      fileExtension == ".zip"
        ? process.env.BucketSourceZip
        : process.env.Bucket;
    console.log("bucketName", bucketName);
    const params = {
      Acl: "public-read",
      Bucket: bucketName,
      Key: "" + file.originalname,
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
      console.log(err);
      res.status(500).send(err);
    });
});

app.get("/get", (req, res) => {
  var params = {
    Bucket: process.env.Bucket,
  };
  s3Client.listObjects(params, (err, data) => {
    if (err) return res.status(400).send("Failed to get object");
    res.send(data);
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});
