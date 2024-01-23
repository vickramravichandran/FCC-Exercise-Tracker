require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {});

const ExerciseSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  duration: Number,
  date: String,
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
});

const LogItemSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: String,
});

const LogSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  count: Number,
  log: [LogItemSchema],
});

const Exercise = mongoose.model("Exercise", ExerciseSchema);
const User = mongoose.model("User", UserSchema);
const Log = mongoose.model("Log", LogSchema);
const LogItem = mongoose.model("LogItem", LogItemSchema);

const addUser = async (username) => {
  const user = new User({
    username,
  });

  const saved = await user.save();

  return { username: saved.username, _id: saved._id };
};

const getAllUsers = async () => {
  const users = await User.find({});

  return users.map((user) => {
    return { username: user.username, _id: user._id };
  });
};

const getUser = async (userId) => {
  const user = await User.findById(userId);
  return { username: user.username, _id: user._id };
};

const addExercise = async (userId, description, duration, date) => {
  const user = await User.findById(userId);
  let dt = new Date(date);
  if (dt.toString() === "Invalid Date") {
    dt = new Date();
  }
  const exercise = new Exercise({
    username: user.username,
    description,
    duration,
    date: dt.toDateString(),
  });

  const saved = await exercise.save();

  await addLog(user, saved);

  return {
    _id: userId,
    username: saved.username,
    description: saved.description,
    duration: saved.duration,
    date: saved.date,
  };
};

const getExercises = async (userId) => {
  const user = await User.findById(userId);
  const exercises = await Exercise.find({ username: user.username });

  return exercises.map((x) => {
    return {
      _id: userId,
      username: x.username,
      description: x.description,
      duration: x.duration,
      date: x.date,
    };
  });
};

const getLog = async (userId, from, to, limit) => {
  const user = await User.findById(userId);
  const exercises = await Exercise.find({ username: user.username });
  const dbLog = await Log.findOne({ username: user.username });

  let logItems = dbLog.log || [];

  if (from && to) {
    const dtFrom = new Date(from);
    const dtTo = new Date(to);

    logItems = logItems.filter((x) => {
      if (!x.date) {
        return false;
      }

      const dt = new Date(x.date);
      return dt >= dtFrom && dt <= dtTo;
    });
  }

  if (limit > 0) {
    logItems = logItems.slice(0, limit);
  }

  return {
    _id: userId,
    username: dbLog.username,
    count: exercises.length,
    log: logItems.map((x) => {
      return {
        description: x.description,
        duration: x.duration,
        date: x.date,
      };
    }),
  };
};

async function addLog(user, exercise) {
  let log = await Log.findOne({ username: user.username });
  if (!log) {
    log = new Log({ username: user.username, count: 0, log: [] });
  }
  log.log.push(
    new LogItem({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date,
    }),
  );
  log.count = log.log.length;
  await log.save();
}

exports.ExerciseModel = Exercise;
exports.UserModel = User;
exports.LogModel = Log;
exports.LogItemModel = LogItem;
//
exports.addUser = addUser;
exports.getUser = getUser;
exports.getAllUsers = getAllUsers;
exports.addExercise = addExercise;
exports.getExercises = getExercises;
exports.getLog = getLog;
