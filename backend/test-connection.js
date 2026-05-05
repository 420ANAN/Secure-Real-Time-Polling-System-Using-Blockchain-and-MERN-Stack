require('dotenv').config();
const mongoose = require('mongoose');

console.log("Testing connection to:", process.env.MONGO_URI.split('@').pop()); // Log only the host part for security

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ SUCCESS: Connected to MongoDB successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ FAILURE: Connection failed.");
    console.error(err);
    process.exit(1);
  });
