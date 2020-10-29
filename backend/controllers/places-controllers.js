const fs = require("fs");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place.",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "Could not find place for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUsername = async (req, res, next) => {
  const username = new RegExp(`^${req.params.username}$`, "i");
  const findFavourites = req.body.findFavourites;
  // let places;
  let userWithPlaces;
  try {
    userWithPlaces = await User.findOne({ username: username }).populate(
      findFavourites ? "favouritePlaces" : "places"
      // "favouritePlaces"
    );
  } catch (err) {
    const error = new HttpError(
      "Fetching places failed, please try again later.",
      500
    );
    return next(error);
  }
  if (!userWithPlaces) {
    return next(
      new HttpError("Could not find places for the provided user id.", 404)
    );
  }
  // console.log(userWithPlaces);
  if (!findFavourites) {
    res.json({
      places: userWithPlaces.places.map((place) =>
        place.toObject({ getters: true })
      ),
    });
  } else {
    res.json({
      favouritePlaces: userWithPlaces.favouritePlaces.map((place) =>
        place.toObject({ getters: true })
      ),
    });
  }
};
////////////////////////////////////////////////////////
//Created Place
const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, address } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this place.", 401);
    return next(error);
  }

  place.title = title;
  place.description = description;
  place.address = address;

  if (req.file) {
    fs.unlink(place.image, (err) => {
      console.log(err);
    });
    place.image = req.file.path;
  }

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500,
      err
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500,
      err
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError("Could not find place for this id.", 404);
    return next(error);
  }

  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this place.",
      401
    );
    return next(error);
  }

  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();

    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: "Deleted place." });
};

const handleFavouritePlace = async (req, res, next) => {
  const userId = req.body.userId;
  const placeId = req.params.pid;
  const place = req.body.place;
  // console.log(placeId);
  //Will be returned as a response depending on whether we removed or added a place to favourites
  let addedToFavourites = true;

  let user;
  try {
    user = await User.findById(userId).populate("favouritePlaces");
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

  //Check if place is already in favourites
  let isInArray;
  if (user.favouritePlaces.length >= 0) {
    isInArray = user.favouritePlaces.some(function (place) {
      return place.equals(placeId);
    });
  }

  //If its not in the array or if
  if (user.favouritePlaces.length == 0 || !isInArray) {
    //Else, save place to favourites
    try {
      addedToFavourites = true;
      const sess = await mongoose.startSession();
      sess.startTransaction();
      user.favouritePlaces.push(place);
      await user.save({ session: sess });
      await sess.commitTransaction();
    } catch (err) {
      const error = new HttpError(
        "Something went wrong, could not add place to favourites.",
        500,
        err
      );
      return next(error);
    }
  } else {
    //User already has place in favourites, remove it
    try {
      addedToFavourites = false;
      const sess = await mongoose.startSession();
      sess.startTransaction();
      user.favouritePlaces.pull(place);
      await user.save({ session: sess });
      await sess.commitTransaction();
    } catch (err) {
      const error = new HttpError(
        "Something went wrong, could not remove place from favourites.",
        500
      );
      return next(error);
    }
  }
  // console.log(user);
  res.status(200).json({ addedToFavourites, favPlaces: user.favouritePlaces });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUsername = getPlacesByUsername;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
exports.handleFavouritePlace = handleFavouritePlace;
