require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://managerbook:managerbook@cluster0-wvqjq.mongodb.net/manager-book?retryWrites=true&w=majority",
  { useUnifiedTopology: true, useNewUrlParser: true }
);
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

// Routes
const mainRoutes = require("./routes/main.route");

// load the cookie-parsing middleware
app.use(cookieParser());

// 1. Register  a user
// 2. Login a user
// 3. Logout a user
// 4. Setup a protected route
// 5. Get a new access token with a refresh token

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// parse application/x-www-form-urlencoded
bodyParser.urlencoded({ extended: false });
// parse application/json
app.use(bodyParser.json());

// Using frontend to display website
// app.set("view engine", "pug");
// app.set("views", "../views");
// app.get("/", (req, res) => {
//   res.render("index");
// });

app.use("/", mainRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server is listening on port: ", process.env.PORT);
});
