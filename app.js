const express = require("express")
const mongoose = require("mongoose");
const cors = require("cors");
const logger = require("./logger/logger");
const morgan = require("morgan");
const routes = require("./routes")

const app = express()

app.use("/uploads", express.static("uploads"));
require("dotenv").config();
app.use(morgan("dev"));
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/", routes);


mongoose.connect(process.env.MONGO_URI).then(() => {
     app.listen(process.env.PORT, () => {
          logger.info(`Server serve with port number: ${process.env.PORT}`);
     })
     logger.info("Successfull connected to Database");
}).catch((err) => {
     console.log(err);
     logger.error("Error", err.message);
});