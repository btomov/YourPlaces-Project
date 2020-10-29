import React, { useState, useContext } from "react";
import UpdatePlace from "../pages/UpdatePlace";

import Button from "../../shared/components/FormElements/Button";
import Modal from "../../shared/components/UIElements/Modal";
import Map from "../../shared/components/UIElements/Map";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import { AuthContext } from "../../shared/context/auth-context";
import { useHttpClient } from "../../shared/hooks/http-hook";
import Icon from "../../shared/components/UIElements/Icon";
import PlaceItemFullView from "./PlaceItemFullView";
import ModalNew from "react-modal";

const PlaceItem = (props) => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [reloadPlace, setReloadPlace] = useState();
  const [showMap, setShowMap] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [viewFullPlace, setViewFullPlace] = useState(false);

  const auth = useContext(AuthContext);
  //TODO: FIX.
  // const openMapHandler = () => setShowMap(true);
  const closeMapHandler = () => setShowMap(false);

  const startEditHandler = (placeId) => {
    setIsEditing(true);
    // props.onEditStart(placeId);
  };

  const stopEditHandler = () => {
    setIsEditing(false);
    setReloadPlace(!reloadPlace);
    // props.onEditEnd();
  };
  const showDeleteWarningHandler = () => {
    setShowConfirmModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
  };

  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false);
    try {
      await sendRequest(
        process.env.REACT_APP_BACKEND_URL + `/places/${props.place.id}`,
        "DELETE",
        null,
        {
          Authorization: "Bearer " + auth.token,
        }
      );
      props.onDelete(props.place.id);
    } catch (err) {}
  };

  const customStyles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.75) ",
    },

    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      minWidth: "50rem",
    },
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {props.place && (
        <Modal
          show={showMap}
          onCancel={closeMapHandler}
          header={props.place.address}
          contentClass="place-item__modal-content"
          footerClass="place-item__modal-actions"
          footer={<Button onClick={closeMapHandler}>CLOSE</Button>}>
          <div className="map-container">
            <Map center={props.place.coordinates} zoom={16} />
          </div>
        </Modal>
      )}
      <Modal
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header="Are you sure?"
        footerClass="place-item__modal-actions"
        footer={
          <React.Fragment>
            <Button inverse onClick={cancelDeleteHandler}>
              CANCEL
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              DELETE
            </Button>
          </React.Fragment>
        }>
        <p>
          Do you want to proceed and delete this place? Please note that it
          can't be undone thereafter.
        </p>
      </Modal>
      {/* Edit Modal */}
      <ModalNew
        isOpen={isEditing}
        onRequestClose={stopEditHandler}
        style={customStyles}
        contentLabel="Example Modal">
        <UpdatePlace place={props.place} />
      </ModalNew>
      {/* Full view modal */}
      <ModalNew
        isOpen={viewFullPlace}
        onRequestClose={() => setViewFullPlace(false)}
        style={customStyles}>
        <PlaceItemFullView place={props.place} />
      </ModalNew>
      {!isLoading && props.place && (
        <div id="custom" className="ui card">
          <div className="image">
            <img
              src={`${process.env.REACT_APP_ASSET_URL}/${props.place.image}`}
              alt={props.place.title}
            />
          </div>
          <div className="content">
            {/* Potentially change back to a-tag since we want a link */}
            <div className="header">{props.place.title}</div>
            <div className="meta">
              <span className="address">{props.place.address}</span>
            </div>
            <div className="description">
              {props.place.description.length > 30
                ? props.place.description.substr(0, 30) + "..."
                : props.place.description}
            </div>
          </div>

          <div className="extra content" id="extra-content">
            <Icon
              onClick={() => setViewFullPlace(true)}
              removeInlineStyle
              icon="eye"
              className="icon icon-eye"
            />

            {auth.isLoggedIn && (
              <Icon
                onClick={() => props.favouriteHandler(props.place)}
                removeInlineStyle
                icon="heart"
                // className={`icon icon-heart${isInFavourites && "__active"}`}
                className={`icon icon-heart${props.isFavourite && "__active"}`}
              />
            )}
            {(auth.userId === props.place.creator || auth.isAdmin) && (
              <div className="extra-content__hidden">
                <Icon
                  onClick={startEditHandler}
                  removeInlineStyle
                  icon="edit"
                  className="icon icon-edit"
                />
                <Icon
                  onClick={showDeleteWarningHandler}
                  removeInlineStyle
                  icon="trash"
                  className="icon icon-trash"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default PlaceItem;
