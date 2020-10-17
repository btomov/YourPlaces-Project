const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const HttpError = require("../models/http-error");
const User = require("../models/user");
const Place = require("../models/place");
const PwChangeRequest = require("../models/reset-password");
const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");

const mongoose = require("mongoose");

const options = {
  auth: {
    api_user: process.env.SENDGRID_USERNAME,
    api_key: process.env.SENDGRID_PASSWORD,
  },
};
const client = nodemailer.createTransport(sgTransport(options));

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
    resetPasswordRequests: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    let errorMsg;
    if (err.errors.username) {
      //TODO: Include email checks? Should also be unique
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
        // isAdmin: existingUser.isAdmin,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
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
  //This needs more work, currently can display the "successfully verified" message with every token.
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

const resetPasswordRequest = async (req, res, next) => {
  const email = req.body.email;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, fetch a user user.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find a user with that email.", 404);
    return next(error);
  }

  //Token that we can send to the user's email and USE TO FIND THE USER
  let identificationToken;
  try {
    identificationToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_KEY,
      { expiresIn: "5m" }
    );
  } catch (err) {
    const error = new HttpError("Could not generate a restoration token", 500);
    return next(error);
  }

  let restorationToken;
  try {
    restorationToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        identificationToken,
      },
      process.env.JWT_KEY,
      { expiresIn: "5m" }
    );
  } catch (err) {
    const error = new HttpError("Could not generate a restoration token", 500);
    return next(error);
  }

  //Token that we store in the DB for extra security. We also send this to the user, UNHASHED (so restorationToken)
  let hashedToken;
  try {
    hashedToken = await bcrypt.hash(restorationToken, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not hash the restoration token.",
      500,
      err
    );
    return next(error);
  }

  const createdResetRequest = new PwChangeRequest({
    userId: user._id,
    identificationToken,
    hashedToken,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdResetRequest.save({ session: sess });
    user.resetPasswordRequests.push(createdResetRequest);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating password reset request failed, please try again.",
      500,
      err
    );
    return next(error);
  }

  //Send a restoration email
  const resetPwEmail = {
    from: process.env.SENDGRID_SENDER,
    to: user.email,
    subject: "Password Reset Request",
    //text: `Copy and paste this link: ${process.env.REACT_APP_BACKEND_URL}/verify/${temporarytoken}`,
    text: `Copy and paste this link: http://localhost:3000/verify/${identificationToken}/${restorationToken}`,
    html: `
    <a href='http://localhost:3000/reset-password/${identificationToken}/${restorationToken}'>
      Click here to choose a new password.
    </a><p>Your link will expire in 5 minutes</p>`,
  };

  try {
    client.sendMail(resetPwEmail);
  } catch (error) {
    return next(error);
  }

  res
    .status(200)
    .json({ message: "Password restoration email has been sent." });
};

const confirmResetTokenValidity = async (req, res, next) => {
  const identificationToken = req.params.identificationToken;
  const restorationToken = req.params.restorationToken;
  //Get two tokens, 1 we send to the user's email for identification in the DB, other we do bcrypt compare to

  let foundPwRequest;
  try {
    foundPwRequest = await await PwChangeRequest.findOne({
      identificationToken: identificationToken,
    }).populate("userId"); //We can optimize this by not populating and instead sending the userId through the email link, but that's for later on
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find token",
      500
    );
    return next(error);
  }

  if (!foundPwRequest) {
    const error = new HttpError(
      "Your link is expired or invalid. Please request a new one.",
      404
    );
    return next(error);
  }

  let isValidToken = false;
  try {
    isValidToken = await bcrypt.compare(
      restorationToken,
      foundPwRequest.hashedToken
    );
  } catch (err) {
    const error = new HttpError("Could not compare the tokens", 500, err);
    return next(error);
  }

  if (!isValidToken) {
    const error = new HttpError("Invalid token.", 403);
    return next(error);
  }
  //Tbd if i want to return the whole request or just validity
  //res.status(200).json({ foundPwRequest });
  res.status(200).json({ isValidToken, userId: foundPwRequest.userId._id });
  //res.status(200).json({ isValidToken });
};

const resetPassword = async (req, res, next) => {
  const { password, userId } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("failed validation");
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find user.",
      500,
      err
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("User not found.", 404);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not change password, please try again.",
      500,
      err
    );
    return next(error);
  }
  user.password = hashedPassword;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    user.resetPasswordRequests = [];
    await PwChangeRequest.deleteMany({ userId: user._id });
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update password.",
      500,
      err
    );
    return next(error);
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

const updateUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { username, email, password } = req.body;
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update user.",
      500
    );
    return next(error);
  }

  if (password) {
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
      const error = new HttpError(
        "Could not change password, please try again.",
        500,
        err
      );
      return next(error);
    }
    user.password = hashedPassword;
  }

  user.username = username;
  user.email = email;
  if (req.file) {
    //Delete old picture before putting in a new one
    fs.unlink(user.image, (err) => {
      console.log(err);
    });
    user.image = req.file.path;
  }

  try {
    await user.save();
  } catch (err) {
    let errorMsg;
    if (err.errors.username || err.errors.email) {
      errorMsg = "User details need to be unique.";
    } else {
      errorMsg = "Something went wrong, could not update user.";
    }
    const error = new HttpError(errorMsg, 500, err);
    return next(error);
  }
  res.status(200).json({ user: user.toObject({ getters: true }) });
};

exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.signup = signup;
exports.login = login;
exports.deleteUser = deleteUser;
exports.verifyUser = verifyUser;
exports.resetPasswordRequest = resetPasswordRequest;
exports.resetPassword = resetPassword;
exports.confirmResetTokenValidity = confirmResetTokenValidity;
exports.updateUser = updateUser;
