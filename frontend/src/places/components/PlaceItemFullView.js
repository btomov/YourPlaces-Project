import React from "react";
import Card from "../../shared/components/UIElements/Card";

const PlaceItem = (props) => {
  return (
    <React.Fragment>
      <div className="place-item">
        <Card className="place-item__content">
          <div className="place-item__image">
            <img src={`${props.place.image}`} alt={props.place.title} />
          </div>
          <div className="place-item__info">
            <h2>{props.place.title}</h2>
            <h3>{props.place.address}</h3>
            <p>{props.place.description}</p>
          </div>
        </Card>
      </div>
    </React.Fragment>
  );
};

export default PlaceItem;
