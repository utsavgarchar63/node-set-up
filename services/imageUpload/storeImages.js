// const multer = require("multer");
// const express = require("express");
// const router = express.Router();
// const mongoose = require("mongoose");
// const imageSchema = mongoose.Schema(
//   {
//     productImage: { type: String, required: true },
//   },
//   {
//     timestamps: true,
//     versionKey: false,
//     autoCreate: true,
//   }
// );
// const newImageSchema = mongoose.model("storeImage", imageSchema, "storeImage");
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const path = req.originalUrl;
//     cb(null, `./uploads/`);
//   },
//   req: function (req, file, cb) {
//     cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
//   },
// });
// const fileFilter = (req, file, cb) => {
//   // reject a file
//   if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 1024 * 1024 * 5,
//   },
//   fileFilter: fileFilter,
// });
// router.post("/", upload.array("image", 20), async (req, res, next) => {
//   let response = [];
//   for (var i = 0; i < req.files.length; i++) {
//     response += `${i + 1}) ${req.files[i].path}; `;
//   }
//   const product = new newImageSchema({
//     productImage: response,
//   });
//   try {
//     const saveImage = await product.save();
//     return res.status(enums.HTTP_CODES.OK).json({
//       data: product,
//       url: "http://localhost:8080/sayaexim/v1/upload-image" + saveImage._id,
//     });
//   } catch (err) {
//     // console.log(err);
//     res.status(500).json({
//       error: err,
//     });
//   }
// });
// module.exports = router;

const enums = require("../../json/enums.json");
const utils = require("../../utils/utils");
const messages = require("../../json/messages.json");
const userRoleSchema = require("../../models/userRole/userRoleSchema");
const roleMaster = require("../../models/roleMaster/roleMasterSchema");
const userMasterSchema = require("../../models/userMaster/userMasterSchema");
const partyMasterSchema = require("../../models/partyMaster/partyMasterSchema");

const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
require("dotenv").config();
// aws.config.update({
//   secretAccessKey: process.env.SECRET_KEY,
//   accessKeyId: process.env.ACCESSKEYID,
//   // region: process.env.REGION,
// });
const s3 = new aws.S3({
  forcePathStyle: false, // Configures to use subdomain/virtual calling format.
  endpoint: "https://blr1.digitaloceanspaces.com",
  credentials: {
    accessKeyId: process.env.SPACEKEYID,
    secretAccessKey: process.env.SPACE_SECRET_KEY
  }
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "video/mp4" ||
    file.mimetype === "video/mkv" ||
    file.mimetype === "image/webp" ||
    file.mimetype === "video/MPEG-4" ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid Mime Type, only JPEG and PNG for images ,mp4 and mkv for video and pdf "), false);
  }
};
const upload = multer({
  fileFilter,
  storage: multerS3({
    s3,
    bucket: process.env.BUCKET,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: async function (req, file, cb) {
      let userData = req.user;
      console.log(userData);
      let userId;
      let { userType } = req.query;
      if (!userType) {
        let userRole = await userRoleSchema.findOne({ iUserID: userData._id });
        if (!userRole) userRole = await userMasterSchema.findOne({ _id: userData._id });
        console.log("userRole", userRole);
        let userRoleId = userRole.vRole ?? userRole?.iRollID[0];
        let presentRole = await roleMaster.findOne({ _id: userRoleId });
        userType = presentRole.vName;
      }
      const userDetail = await userMasterSchema.findOne({ _id: userData._id });
      // console.log("===========", userDetail);
      if (userType === "super_admin") {
        userId = "images";
      } else {
        userId = userData._id || userDetail.iPartyID || userDetail.vCurrentCompanyID;
      }
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `aaziko/${userType}/${userId}/` + file.fieldname + "-" + uniqueSuffix + "." + file.originalname.split(".")[file.originalname.split(".").length - 1]);
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 20, // we are allowing only 2 MB files
  },
});

const upload4Buyer = multer({
  fileFilter,
  storage: multerS3({
    s3,
    bucket: process.env.BUCKET,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: async function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `aaziko/buyer/` + file.fieldname + "-" + uniqueSuffix + "." + file.originalname.split(".")[file.originalname.split(".").length - 1]);
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 2, // we are allowing only 2 MB files
  },
});

const replaceImage = multer({
  fileFilter,
  storage: multerS3({
    s3,
    bucket: process.env.BUCKET,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: async function (req, file, cb) {
      let { filePath } = req.query;
     cb(null, filePath);
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 20, // we are allowing only 2 MB files
  },
});

const deleteImage = async function (req, res, next) {
  try {
    const decoded = req.user;
    console.log("decoded?????????", decoded);
    const superAdminData = await utils.validateSuperAdmin(decoded);
    const userData = await utils.validateUserMaster(decoded);
    // console.log(
    //   "superAdminData ============================",
    //   userData.data,
    //   superAdminData.data
    // ); \
    if (userData.data) {
      if (userData.success === false) {
        return res.status(enums.HTTP_CODES.NOT_ACCEPTABLE).json({ success: false, message: messages.VENDOR_NOT_FOUND });
      }
      const userRoleData = await userMasterSchema.findOne({ _id: userData.data._id }).populate([
        {
          path: "vRole",
        },
        {
          path: "functionId",
        },
      ]);
      // console.log("userRoleData", userRoleData);
      if (!userRoleData) {
        return res.status(enums.HTTP_CODES.NOT_ACCEPTABLE).json({ success: false, message: messages.VENDOR_NOT_FOUND });
      }
      // res.send({ userRoleData: userRoleData });
      let array = userRoleData.functionId;
  
      let access;
      array.filter((data) => {
        // // console.log("userData.data", userData.data, "superAdminData.data", superAdminData.data)
        // console.log("arrayData", data.vName);
        if (data.vName === enums.ROLE_PERMISSION.DELETE_AWS_IMAGES) {
          const temporary = data.vName;
          access = temporary;
          return temporary;
        }
      });
      if (access !== enums.ROLE_PERMISSION.DELETE_AWS_IMAGES) {
        return res.status(enums.HTTP_CODES.NOT_ACCEPTABLE).json({ success: false, message: messages.VENDOR_NOT_FOUND });
      }
    }
    if (superAdminData.success === false && userData.success === false) {
      if (superAdminData.success === false) {
        return res.status(enums.HTTP_CODES.NOT_ACCEPTABLE).json({ success: false, message: messages.SUPER_ADMIN_NOT_FOUND });
      } else {
        return res.status(enums.HTTP_CODES.NOT_ACCEPTABLE).json({ success: false, message: messages.VENDOR_NOT_FOUND });
      }
    }

    if (req.body.keys instanceof Array == false) {
    return res.status(enums.HTTP_CODES.FORBIDDEN).json({
      success: false,
      message: `${messages.TYPE_NOT_SUPPORTED}`,
    });
  }

  let array = req.body.keys;
  let imageNameArray = [];
  let url = "";
  let deleteCount = 0;
  let notFoundCount = 0;
  for (let i = 0; i < array.length; i++) {
    url = array[i].split("/")[array[i].split("/").length - 1];

    //  let str;
    //  [str,url] = array[i].split(".com/");
    // // console.log('url :>> ', url);
    imageNameArray.push(url);
    const s3 = new aws.S3({
      forcePathStyle: false, // Configures to use subdomain/virtual calling format.
      endpoint: "https://blr1.digitaloceanspaces.com",
      credentials: {
        accessKeyId: process.env.SPACEKEYID,
        secretAccessKey: process.env.SPACE_SECRET_KEY
      }
    });
    var params = {
      Bucket: process.env.BUCKET,
      Key: req.body.keys[i],
    };
    try {
      await s3.getObject(params).promise()
      await s3.deleteObject(params).promise()
      deleteCount++;
    } catch (error) {
      notFoundCount++;
    }
  }
  req.user.payload = {
    success: true,
    deleteCount: deleteCount,
    notFoundCount: notFoundCount,
  }
  next();
} catch (error) {
  console.log("error", error);
}
};

const deleteImageBuyer = async function (req, res, next) {
  if (req.body.keys instanceof Array == false) {
    return res.status(enums.HTTP_CODES.FORBIDDEN).json({
      success: false,
      message: `${messages.TYPE_NOT_SUPPORTED}`,
    });
  }

  let array = req.body.keys;
  let imageNameArray = [];
  let url = "";
  for (let i = 0; i < array.length; i++) {
    let str;
    [str, url] = array[i].split(".com/");
    // console.log("url :>> ", url);
    imageNameArray.push(url);
    const s3 = new aws.S3({
      forcePathStyle: false, // Configures to use subdomain/virtual calling format.
      endpoint: "https://blr1.digitaloceanspaces.com",
      credentials: {
        accessKeyId: process.env.SPACEKEYID,
        secretAccessKey: process.env.SPACE_SECRET_KEY
      }
    });
    var params = {
      Bucket: process.env.BUCKET,
      Key: imageNameArray[i],
    };
    s3.getObject(params, (err) => {
      if (err) {
        const message = "File not found";
        const payload = {
          success: false,
          message: message,
        };
        req.user = payload;
        next();
      }
      s3.deleteObject(params, async function (err, data) {
        const message = "Files deleted";
        const payload = {
          success: true,
          data: message,
        };
        req.user = payload;
        next();
      });
    });
  }
};

// Error handling
const uploadError = (error, req, res, next) => {
  console.log("error", error);

  if (error instanceof multer.MulterError) {
    console.log("error", error.code);
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(enums.HTTP_CODES.BAD_REQUEST).send({
        status: false,
        message: messages.FILE_IS_TOO_LARGE,
        error: "file is too large",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(enums.HTTP_CODES.BAD_REQUEST).send({
        status: false,
        message: messages.MAXIMUM_FILE_UPLOAD_LIMIT,
        error: "maximum file upload limit",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(enums.HTTP_CODES.BAD_REQUEST).send({
        status: false,
        message: messages.FILE_TYPE_NOT_SUPPORTED,
        error: "file-type not supported",
      });
    }
  }
  else if(error.message === "Invalid Mime Type, only JPEG and PNG for images ,mp4 and mkv for video and pdf "){
    return res.status(enums.HTTP_CODES.BAD_REQUEST).send({
      status: false,
      message: messages.FILE_TYPE_NOT_SUPPORTED,
      error: "Invalid Mime Type, only JPEG and PNG for images ,mp4 and mkv for video and pdf ",
    });
  }else{
    next();
  }
};

module.exports = { upload, deleteImage, upload4Buyer, deleteImageBuyer, replaceImage, uploadError };
