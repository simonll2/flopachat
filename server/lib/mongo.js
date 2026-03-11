const mongoose = require("mongoose");
require("dotenv").config();

const mongodbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/flopachat";

mongoose.set("strictQuery", true);

const connectWithRetry = async () => {
  const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  };

  while (true) {
    try {
      await mongoose.connect(mongodbURI, options);
      console.log("Connected to Database");
      break;
    } catch (err) {
      console.error("Mongo connection failed, retrying in 5 seconds...", err.message);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

connectWithRetry();

const db = mongoose.connection;

db.on("error", (error) => console.error("Connection error:", error));

module.exports = db;
