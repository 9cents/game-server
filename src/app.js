const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const pool = require("./database/db").getInstance();

const login = require("./controllers/login");
const register = require("./controllers/register");

var resourcesRouter = require("./resources/resourcesRouter");

// Set up Express App
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res, next) => {
  // console.log("hello world");
  res.send("Hello from backend");
});

app.get("/test", (req, res, next) => {
  // console.log("hello world");
  res.send("Test is working");
});

// Login route for instructor.
// First arg is database reference, second is bcrypt to hash password
app.post("/login", login.loginHandler(pool));
app.post("/register", register.registerHandler(pool));

app.use("/", resourcesRouter);

module.exports = app;
