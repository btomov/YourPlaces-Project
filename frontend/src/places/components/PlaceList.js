import React, { useContext, useState, useEffect } from "react";
import Card from "../../shared/components/UIElements/Card";
import PlaceItem from "./PlaceItem";
import Button from "../../shared/components/FormElements/Button";
import { AuthContext } from "../../shared/context/auth-context";
import { useHttpClient } from "../../shared/hooks/http-hook";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";

const PlaceList = (props) => {
  const auth = useContext(AuthContext);
  const { error, sendRequest, clearError } = useHttpClient();
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
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <ul className="place-list">
        {favPlaces &&
          props.items.map((place) => (
            <PlaceItem
              key={place.id}
              isFavourite={favPlaces.includes(place.id) ? true : false}
              favouriteHandler={toggleFavouritePlaceHandler}
              onDelete={props.onDeletePlace}
              onEditStart={props.onEditStart}
              onEditEnd={props.onEditEnd}
              place={place}
              // id={place.id}
              // creatorId={place.creator}
              // image={place.image}
              // title={place.title}
              // description={place.description}
              // address={place.address}
              // coordinates={place.location}
            />
          ))}
      </ul>
    </React.Fragment>
  );
};

export default PlaceList;
