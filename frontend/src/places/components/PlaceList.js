import React, { useContext, useState } from "react";

import Card from "../../shared/components/UIElements/Card";
import PlaceItem from "./PlaceItem";
import Button from "../../shared/components/FormElements/Button";
// import "./PlaceList.css";
import { AuthContext } from "../../shared/context/auth-context";
import { useHttpClient } from "../../shared/hooks/http-hook";

const PlaceList = (props) => {
  const auth = useContext(AuthContext);
  const [isInFavourites, setIsInFavourites] = useState(false);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [FavPlace, setFavPlace] = useState();

  // const getFavouritedPlace = (place) => {
  //   setFavPlace(place);
  // };

  const toggleFavouritePlaceHandler = async (place) => {
    try {
      const responseData = await sendRequest(
        process.env.REACT_APP_BACKEND_URL + `/places/favourite/${props.id}`,
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
      console.log(responseData);
      //If it successfully added the thing
      if (responseData) {
        setIsInFavourites(true);
      } else {
        setIsInFavourites(false);
      }
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
      {props.items.map((place) => (
        <PlaceItem
          isFavourite={isInFavourites}
          favouriteHandler={toggleFavouritePlaceHandler}
          key={place.id}
          id={place.id}
          creatorId={place.creator}
          onDelete={props.onDeletePlace}
          onEditStart={props.onEditStart}
          onEditEnd={props.onEditEnd}
          // place={place}
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
