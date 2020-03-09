const multer = require("multer");
const { v1: uuidv1 } = require("uuid");

const fs = require("fs");
const path = require("path");

const MIME_TYPE = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg"
};

const uploadIt = multer({
  limit: 5000000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads");
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE[file.mimetype];
      const fileName = `${uuidv1()}.${ext}`;
      cb(null, fileName);
    }
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE[file.mimetype];
    const error = isValid ? null : new Error("Could NOT upload the file.");
    cb(error, isValid);
  }
});

const deleteFile = filePath => {
  try {
    fs.unlink(path.join(__dirname, "..", filePath), err => {
      console.log(err);
    });
  } catch (err) {
    console.log(err);
  }
};

exports.deleteFile = deleteFile;
exports.uploadIt = uploadIt;
