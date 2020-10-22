import React, { useContext, useState, useEffect } from "react";

import Card from "../../shared/components/UIElements/Card";
import PlaceItem from "./PlaceItem";
import Button from "../../shared/components/FormElements/Button";
// import "./PlaceList.css";
import { AuthContext } from "../../shared/context/auth-context";
import { useHttpClient } from "../../shared/hooks/http-hook";

const PlaceList = (props) => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [favPlaces, setFavPlaces] = useState();

  useEffect(() => {
    setFavPlaces(JSON.parse(localStorage.getItem("favouritePlaces")) || []);
  }, []);

  const toggleFavouritePlaceHandler = async (place) => {
    let placeId = place.id;
    try {
      const responseData = await sendRequest(
        process.env.REACT_APP_BACKEND_URL + `/places/favourite/${placeId}`,
        "POST",
        JSON.stringify({
          userId: auth.userId,
          place,
        }),
        {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        }
      );
      //If it successfully added the thing
      if (responseData.addedToFavourites) {
        // setIsInFavourites(true);
        //Get array, push new place into it, save back into localstorage
        let oldFavPlaces =
          JSON.parse(localStorage.getItem("favouritePlaces")) || [];
        oldFavPlaces.push(placeId);
        localStorage.setItem("favouritePlaces", JSON.stringify(oldFavPlaces));
      } else {
        let oldFavPlaces =
          JSON.parse(localStorage.getItem("favouritePlaces")) || [];
        oldFavPlaces.splice(oldFavPlaces.indexOf(placeId.toString()), 1);
        localStorage.setItem("favouritePlaces", JSON.stringify(oldFavPlaces));
      }
      setFavPlaces(JSON.parse(localStorage.getItem("favouritePlaces")) || []);
    } catch (err) {}
  };

  let notFoundCard;
  //TODO: This won't work since we now pass props.username
  if (auth.username === props.username) {
    notFoundCard = (
      <div className="place-list center">
        <Card>
          <h2>No places found. Maybe create one?</h2>
          <Button to="/places/new">Share Place</Button>
        </Card>
      </div>
    );
  } else {
    notFoundCard = (
      <div className="place-list center">
        <Card>
          <h2>This user has no places</h2>
        </Card>
      </div>
    );
  }
  if (props.items.length === 0) {
    return <div>{notFoundCard}</div>;
  }

  return (
    <ul className="place-list">
      {/* TODO: Delete props i no longer need */}
      {favPlaces &&
        props.items.map((place) => (
          <PlaceItem
            isFavourite={favPlaces.includes(place.id) ? true : false}
            favouriteHandler={toggleFavouritePlaceHandler}
            key={place.id}
            id={place.id}
            creatorId={place.creator}
            onDelete={props.onDeletePlace}
            onEditStart={props.onEditStart}
            onEditEnd={props.onEditEnd}
            place={place}
            // image={place.image}
            // title={place.title}
            // description={place.description}
            // address={place.address}
            // coordinates={place.location}
          />
        ))}
    </ul>
  );
};

export default PlaceList;
