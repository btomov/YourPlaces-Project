import React, { useContext } from "react";

import Card from "../../shared/components/UIElements/Card";
import PlaceItem from "./PlaceItem";
import Button from "../../shared/components/FormElements/Button";
// import "./PlaceList.css";
import { AuthContext } from "../../shared/context/auth-context";

const PlaceList = (props) => {
  const auth = useContext(AuthContext);

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
    <ul className="place-list">
      {/* TODO: Delete props i no longer need */}
      {props.items.map((place) => (
        <PlaceItem
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
