require("dotenv").config();
const logger = require("../logger/logger");
const bcrypt = require("bcrypt");
const enums = require("../json/enums.json");
const messages = require("../json/messages.json");
const fs = require("fs");
const { ObjectId } = require("mongodb");

module.exports = {

     validateUserMaster: async (decoded) => {
          if (!decoded._id) {
               const message = {
                    status: enums.HTTP_CODES.NOT_ACCEPTABLE,
                    message: messages.USER_DOES_NOT_EXIST,
               };
               return {
                    success: false,
                    message: message,
               };
          }

          const userData = await userSchema.findOne({ _id: decoded._id }).populate({
               path: "iRollID",
               model: "roleMaster",
          });

          if (userData === null) {
               const message = {
                    status: enums.HTTP_CODES.NOT_ACCEPTABLE,
                    message: messages.USER_DOES_NOT_EXIST,
               };
               return {
                    success: false,
                    message: message,
               };
          }
          return {
               success: true,
               data: userData,
          };
     },

     validateFields: (data, fields) => {
          let k = 0;
          let data4message = "please enter valid ";
          let array4fields = [];
          for (let i = 0; i < data.length; i++) {
               if (!data[i]) {
                    array4fields.push(fields[i]);
                    k = 1;
               }
          }

          if (k == 1) {
               for (let i = 0; i < array4fields.length - 1; i++) {
                    data4message = data4message + array4fields[i] + ", ";
               }
               data4message = data4message + array4fields[array4fields.length - 1];
               return data4message;
          } else {
               return null;
          }
     },
     validateExistFields: (data, fields) => {
          let k = 0;
          let data4message = `Entered `;
          let array4fields = [];
          for (let i = 0; i < data.length; i++) {
               if (data[i]) {
                    array4fields.push(fields[i]);
                    k = 1;
               }
          }
          if (k == 1) {
               for (let i = 0; i < array4fields.length - 1; i++) {
                    data4message = data4message + array4fields[i] + ", ";
               }
               data4message = data4message + array4fields[array4fields.length - 1];
               return data4message + ` is already exists.`;
          } else {
               return null;
          }
     },
     checkBooleanData: (data) => {
          if (data == null) {
               data4message = "boolean type must not be null";
               return data4message;
          }
     },

     emailExpression: (data4email) => {
          const emailExpression = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(
               data4email
          );
          if (emailExpression) {
               return true;
          } else {
               return false;
          }
     },
     usernameExpression: (data4username) => {
          const usernameRegex = /^[A-Za-z0-9_.]+$/.test(data4username);
          if (usernameRegex) {
               return true;
          } else {
               return false;
          }
     },
     phoneExpression: (data4phone) => {
          const phonenoRegex =
               /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,13}$/.test(
                    data4phone
               );
          if (phonenoRegex) {
               return true;
          } else {
               return false;
          }
     },
     passwordExpression: (data4password) => {
          const passwordExpression =
               /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(
                    data4password
               );
          if (passwordExpression) {
               return true;
          } else {
               return false;
          }
     },
     websiteExpression: (data4website) => {
          const websiteExpression =
               /^((https?):\/\/)?([w|W]{3}\.)+[a-zA-Z0-9\-\.]{3,}\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/.test(
                    data4website
               );
          if (websiteExpression) {
               return true;
          } else {
               return false;
          }
     },
     gstExpression: (data4website) => {

          const gstExpression =
               /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
                    data4website
               );
          if (gstExpression) {
               return true;
          } else {
               return false;
          }
     },


     validationForArray: (dataInArray, fieldInArray) => {
          let k = 0;
          let message = "";
          for (let i = 0; i < dataInArray.length; i++) {
               if (dataInArray[i] !== null) {
                    if (dataInArray[i] instanceof Array == false) {
                         k = 1;
                         message = message + fieldInArray[i];
                    }
               }
          }
          if (k == 1) {
               return { success: false, message: message + " must be in array." };
          }
     },

     existArrayFieldInDatabase: async (schemaName, id) => {
          const exist = await schemaName.findOne({
               vItems: { $elemMatch: { _id: id } },
          });
          return exist;
     },
};