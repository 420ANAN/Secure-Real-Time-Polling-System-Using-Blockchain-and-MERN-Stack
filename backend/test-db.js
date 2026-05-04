const mongoose = require('mongoose');
const uri = "mongodb://tom797015_db_user:lt8GcX12OtBv0Qnv@ac-subwitq-shard-00-00.hngj5bv.mongodb.net:27017,ac-subwitq-shard-00-01.hngj5bv.mongodb.net:27017,ac-subwitq-shard-00-02.hngj5bv.mongodb.net:27017/VoteSecure?ssl=true&authSource=admin&retryWrites=true&w=majority";

console.log("Attempting to connect to MongoDB Atlas...");
mongoose.connect(uri)
  .then(() => {
    console.log("SUCCESS: Connected to MongoDB Atlas!");
    process.exit(0);
  })
  .catch(err => {
    console.error("FAILURE: Connection refused.");
    console.error(err);
    process.exit(1);
  });
