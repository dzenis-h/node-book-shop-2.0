const multer = require("multer");
const uuid = require("uuid/v1");
const fs = require("fs");

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
      const fileName = `${uuid()}.${ext}`;
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
    fs.unlink(filePath, err => {
      console.log(err);
    });
  } catch (err) {
    console.log(err);
  }
};

exports.deleteFile = deleteFile;
exports.uploadIt = uploadIt;
