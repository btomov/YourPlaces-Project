const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const HttpError = require("../models/http-error");
const User = require("../models/user");
const Place = require("../models/place");
const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");

const mongoose = require("mongoose");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const getUserById = async (req, res, next) => {
  const userId = req.params.uid;
  //console.log(userId); //Pops if i go directly to /users/id OR apparently if i go to My Places..but only sometimes?
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a user.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      "Could not find user for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ user: user.toObject({ getters: true }) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        "Invalid inputs passed, please check your data.",
        // errors.errors[0].param + " " + errors.errors[0].msg,
        422
      )
    );
  }

  const { username, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500,
      err
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User exists already, please login instead.",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not create user, please try again.",
      500,
      err
    );
    return next(error);
  }

  let temporarytoken;
  try {
    temporarytoken = jwt.sign({ username, email }, process.env.JWT_KEY, {
      expiresIn: "12h",
    });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500,
      err
    );
    return next(error);
  }

  const createdUser = new User({
    username,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
    temporarytoken,
  });

  try {
    await createdUser.save();
  } catch (err) {
    let errorMsg;
    if (err.errors.username) {
      errorMsg = "This username is already taken";
    } else {
      errorMsg = "Signing up failed, please try again later.";
    }
    const error = new HttpError(errorMsg, 500, err);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: createdUser.id,
        email: createdUser.email,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500,
      err
    );
    return next(error);
  }

  //Send verification email
  const options = {
    auth: {
      api_user: process.env.SENDGRID_USERNAME,
      api_key: process.env.SENDGRID_PASSWORD,
    },
  };
  const client = nodemailer.createTransport(sgTransport(options));

  const emailActivate = {
    from: process.env.SENDGRID_SENDER,
    to: email,
    subject: "Localhost Account Verification",
    //text: `Copy and paste this link: ${process.env.REACT_APP_BACKEND_URL}/verify/${temporarytoken}`,
    text: `Copy and paste this link: http://localhost:3000/verify/${temporarytoken}`,
    html: `
    <a href='http://localhost:3000/verify/${temporarytoken}'>
      Click to confirm your email.
    </a>`,
  };

  try {
    client.sendMail(emailActivate);
  } catch (error) {
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }

  if (!existingUser.isConfirmed) {
    const error = new HttpError("You need to confirm your email first", 403);
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again.",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email,
        isAdmin: existingUser.isAdmin,
      },
      process.env.JWT_KEY,
      { expiresIn: 10 }
    );
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({
    username: existingUser.username,
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
    isAdmin: existingUser.isAdmin,
  });
};

const deleteUser = async (req, res, next) => {
  const userId = req.params.uid;
  const deleterId = req.userData.userId;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete user.",
      500
    );
    return next(error);
  }

  let deletingUser;
  try {
    deletingUser = await User.findById(deleterId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find deleter.",
      500
    );
    return next(error);
  }

  if (!deletingUser || !deletingUser.isAdmin) {
    const error = new HttpError(
      "You need to be an admin to delete another user!",
      401
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for this id.", 404);
    return next(error);
  }

  if (user.isAdmin) {
    const error = new HttpError("Cannot delete admin users!", 401);
    return next(error);
  }

  const imagePath = user.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await user.remove({ session: sess });
    await Place.deleteMany({ creator: user._id });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Something went wrong, could not delete user.",
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: "Deleted user." });
};

const verifyUser = async (req, res, next) => {
  User.findOne({ temporarytoken: req.params.token }, (err, user) => {
    if (err) throw err; // Throw error if cannot login
    const token = req.params.token; // Save the token from URL for verification
    // Function to verify the user's token
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        res.json({ success: false, message: "Activation link has expired." }); // Token is expired
      } else if (!user) {
        res.json({ success: false, message: "Activation link has expired." }); // Token may be valid but does not match any user in the database
      } else {
        user.temporarytoken = false; // Remove temporary token
        user.isConfirmed = true; // Change account status to Activated
        // Mongoose Method to save user into the database
        user.save((err) => {
          if (err) {
            console.log(err); // If unable to save user, log error info to console/terminal
          } else {
            res.json({
              succeed: true,
              message: "User has been successfully activated",
            });
          }
        });
      }
    });
  });
};

const resetPassword = async (req, res, next) => {
  const email = req.body.email;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete user.",
      500
    );
    return next(error);
  }
  console.log(user);
  // if (!user) {
  //   const error = new HttpError("Could not find user for this id.", 404);
  //   return next(error);
  // }

  // try {
  //   const sess = await mongoose.startSession();
  //   sess.startTransaction();
  //   await user.remove({ session: sess });
  //   await Place.deleteMany({ creator: user._id });
  //   await sess.commitTransaction();
  // } catch (err) {
  //   console.log(err);
  //   const error = new HttpError(
  //     "Something went wrong, could not delete user.",
  //     500
  //   );
  //   return next(error);
  // }

  //res.status(200).json({ message: "Deleted user." });
};

exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.signup = signup;
exports.login = login;
exports.deleteUser = deleteUser;
exports.verifyUser = verifyUser;
exports.resetPassword = resetPassword;
