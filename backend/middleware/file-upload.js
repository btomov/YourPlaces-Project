const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

const s3Config = new AWS.S3({
  accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
  secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
  Bucket: "your-places",
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// this is just to test locally if multer is working fine.
const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const multerS3Config = multerS3({
  s3: s3Config,
  bucket: "your-places",
  ACL: "public-read",

  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    console.log(file);
    let newFileName = new Date().toISOString() + "-" + file.originalname;
    let fullPath =
      "uploads/images/" +
      (req.body.address ? "places/" : "users/") +
      newFileName;
    cb(null, fullPath);
  },
});

const upload = multer({
  storage: multerS3Config,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // we are allowing only 5 MB files
  },
});

exports.fileUpload = upload;
