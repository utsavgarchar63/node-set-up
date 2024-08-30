const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const utils = require("../../utils/utils");
const enums = require("../../json/enums.json");
const messages = require("../../json/messages.json");
const { upload, deleteImage, upload4Buyer, deleteImageBuyer, replaceImage, uploadError } = require("./storeImages");

const uploadImage = upload.array("image", 20);
const upload4BuyerImage = upload4Buyer.array("image", 20);

router.post("/image-upload", auth, uploadImage, uploadError, async function (req, res) {
  const decoded = req.user;
  const superAdminData = await utils.validateSuperAdmin(decoded);
  const userData = await utils.validateUserMaster(decoded);
  if (userData.data) {
    if (userData.success === false) {
      return res.status(enums.HTTP_CODES.NOT_ACCEPTABLE).json({ success: false, message: messages.VENDOR_NOT_FOUND });
    }
    const userRoleData = await userSchema.findOne({ _id: userData.data._id }).populate([
      {
        path: "vRole",
      },
      {
        path: "functionId",
      },
    ]);
    if (!userRoleData) {
      return res.status(enums.HTTP_CODES.NOT_ACCEPTABLE).json({ success: false, message: messages.VENDOR_NOT_FOUND });
    }
    // res.send({ userRoleData: userRoleData })
    let array = userRoleData.functionId;

    let access;
    array.filter((data) => {
      // // console.log("arrayData", data.vName)
      if (data.vName === enums.ROLE_PERMISSION.UPLOAD_IMAGES) {
        const temporary = data.vName;
        access = temporary;
        return temporary;
      }
    });
    if (access !== enums.ROLE_PERMISSION.UPLOAD_IMAGES) {
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
  let response = [];
  if (req.files instanceof Array == false) {
    return res.status(enums.HTTP_CODES.FORBIDDEN).json({
      success: false,
      message: `${messages.TYPE_NOT_SUPPORTED}`,
    });
  }
  for (var i = 0; i < req.files.length; i++) {
    response.push(req.files[i].location);
  }
  return res.json({ imageUrl: response });
});

router.post("/image-upload-buyer", upload4BuyerImage, uploadError, async function (req, res) {
  let response = [];
  if (req.files instanceof Array == false) {
    return res.status(enums.HTTP_CODES.FORBIDDEN).json({
      success: false,
      message: `${messages.TYPE_NOT_SUPPORTED}`,
    });
  }
  for (var i = 0; i < req.files.length; i++) {
    response.push(req.files[i].location);
  }
  return res.json({ imageUrl: response });
});

router.post("/replace-image",  auth ,replaceImage.array("image", 20), uploadError, async function (req, res) {
  const decoded = req.user;
  const superAdminData = await utils.validateSuperAdmin(decoded);
  const userData = await utils.validateUserMaster(decoded);
  if (userData.data) {
    if (userData.success === false) {
      return res.status(enums.HTTP_CODES.NOT_ACCEPTABLE).json({ success: false, message: messages.VENDOR_NOT_FOUND });
    }
    const userRoleData = await userSchema.findOne({ _id: userData.data._id }).populate([
      {
        path: "vRole",
      },
      {
        path: "functionId",
      },
    ]);
    if (!userRoleData) {
      return res.status(enums.HTTP_CODES.NOT_ACCEPTABLE).json({ success: false, message: messages.VENDOR_NOT_FOUND });
    }
    // res.send({ userRoleData: userRoleData })
    let array = userRoleData.functionId;

    let access;
    array.filter((data) => {
      // // console.log("arrayData", data.vName)
      if (data.vName === enums.ROLE_PERMISSION.UPLOAD_IMAGES) {
        const temporary = data.vName;
        access = temporary;
        return temporary;
      }
    });
    if (access !== enums.ROLE_PERMISSION.UPLOAD_IMAGES) {
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
  let response = [];
  if (req.files instanceof Array == false) {
    return res.status(enums.HTTP_CODES.FORBIDDEN).json({
      success: false,
      message: `${messages.TYPE_NOT_SUPPORTED}`,
    });
  }
  for (var i = 0; i < req.files.length; i++) {
    response.push(req.files[i].location);
  }
  return res.json({ imageUrl: response });
}),

router.delete("/delete", auth, deleteImage, async function (req, res) {

  return res.status(200).json(req.user);
});

router.delete("/delete-image-buyer", deleteImageBuyer, function (req, res) {
  const messaage = deleteImageBuyer.message;
  return res.status(200).json(req.user);
});

module.exports = router;
