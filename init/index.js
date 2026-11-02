const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const { object } = require("joi");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((object) => ({ ...object, Owner: "64a1f3e5c9b1f2a5d6e8b7c4" }));
  await Listing.insertMany(initData.data);
  let listings = await Listing.find({});
  console.log(listings);
};

initDB();