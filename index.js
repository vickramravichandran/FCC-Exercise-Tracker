require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const myApp = require("./myApp.js");

app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res, next) => {
  const username = req.body.username || "";

  if (!username) {
    return next({ error: "username required" });
  }

  try {
    const user = await myApp.addUser(username);
    res.json(user);
  } catch (err) {
    return next(err);
  }
});

app.get("/api/users", async (req, res, next) => {
  try {
    const users = await myApp.getAllUsers();
    res.json(users);
  } catch (err) {
    return next(err);
  }
});

app.get("/api/users/:_id", async (req, res, next) => {
  try {
    const user = await myApp.getUser(req.params._id);
    res.json(user);
  } catch (err) {
    return next(err);
  }
});

app.post("/api/users/:_id/exercises", async (req, res, next) => {
  const userId = req.params._id;
  const description = req.body.description;
  const duration = req.body.duration;
  const date = req.body.date;

  try {
    const exercise = await myApp.addExercise(
      userId,
      description,
      duration,
      date,
    );

    res.json(exercise);
  } catch (err) {
    return next(err);
  }
});

app.get("/api/users/:_id/exercises", async (req, res, next) => {
  const userId = req.params._id;

  try {
    const items = await myApp.getExercises(userId);
    res.json(items);
  } catch (err) {
    return next(err);
  }
});

app.get("/api/users/:_id/logs", async (req, res, next) => {
  const userId = req.params._id;
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;

  try {
    const log = await myApp.getLog(userId, from, to, limit);
    res.json(log);
  } catch (err) {
    return next(err);
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
