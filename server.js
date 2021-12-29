const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// SETTING UP ENVIRONMENT VARIABLES

const PORT = process.env.PORT;
let DB;

if (process.env.NODE_ENV === "development") {
  DB = process.env.DB_DEV;
} else if (process.env.NODE_ENV === "production") {
  DB = process.env.DB_PROD;
}

// DATABSE CONNECTION
mongoose
  .connect(DB, {
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.log(err.name, err.message);
  });

// RUNNING THE SERVER
const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
